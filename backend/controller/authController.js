const Joi = require('joi');
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");
const JWTService = require('../services/JWTService')
const RefreshToken = require('../models/token')

const passwordExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const authController = {
    async login(req, res, next) {
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordExp).required(),
        })
        const { error } = userLoginSchema.validate(req.body);

        if (error) {
            return next(error)
        }

        const { username, password } = req.body;
        let user;
        try {
            //match username
            user = await User.findOne({ username: username })
            if (!user) {
                const error = {
                    stattus: 401,
                    message: "Invalid username or password"
                }
                return next(error);
            }
            //match password
            //password --> hash --> match
            const matchPassword = await bcrypt.compare(password, user.password);

            if (!matchPassword) {
                const error = {
                    stattus: 401,
                    message: "Invalid password"
                }
                return next(error);
            }



        }
        catch (e) {
            return next(e);

        }

        
        //token generation
        const accessToken = JWTService.signAccessToken({_id:user._id}, '30m');
        const refreshToken = JWTService.signRefreshToken({_id:user._id}, '60m');

        //update refresh token in db
        try{
            await RefreshToken.updateOne({
                _id: user._id
            },
            {token: refreshToken},
            {upsert: true}, //if recorde find then update else create new record.
            );
        }
        catch(e){
            return next(e)
        }

        //send token in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true 
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true 
        })

        const userData = new UserDTO(user);

        return res.status(200).json({ user: userData, auth : true });


    },
    async register(req, res, next) {
        //1. validate user input
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordExp).required(),
            confirmPassword: Joi.ref('password'),
        })
        const { error } = userRegisterSchema.validate(req.body)
        //2. if error in validation  -> return error via middleware.
        //Middleware is simple function that works between req and response.
        //if we do't handle error then our node server will crash.
        // So when we interact with DB then use try catch and in case of validation we will use middleware.
        if (error) {
            return next(error)

        }
        //3. if username or email already exist  -> return error.

        const { username, name, email, password } = req.body;

        try {

            const isEmailExist = await User.exists({ email });

            const isUsernameExist = await User.exists({ username });

            if (isEmailExist) {
                const error = {
                    status: 409,
                    message: 'Email already exist'
                }
                return next(error)
            }

            if (isUsernameExist) {
                const error = {
                    stattus: 409,
                    message: 'Username not available. Use antoher name.'
                }
                return next(error)
            }

        } catch (e) {
            return next(e)
        }

        //4. if password hash.
        const encryptPassword = await bcrypt.hash(password, 10);

        //5. store user data in db.
        let usr;
        let accessToken;
        let refreshToken;

        try {
            const registerUSer = new User({
                username,
                name,
                email,
                password: encryptPassword
            });
            usr = await registerUSer.save();

            //token generation
            accessToken = JWTService.signAccessToken({_id:usr._id}, '30m');
            refreshToken = JWTService.signRefreshToken({_id:usr._id}, '60m');

        } catch (e) {
            return next(e);

        }

        //store refresh token in db
        await JWTService.storeRefreshToke(refreshToken, usr._id);

        //send token in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true // only accessible on server side. client cant access it. vluneraablity of xss will reduced 
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true // only accessible on server side. client cant access it. vluneraablity of xss will reduced 
        })

        const userData = new UserDTO(usr);

        //6. return reponse.
        return res.status(201).json({ user: userData, auth: true })
    },
    async logout(req, res, next) {

        //1. delete refresh token from  db
        const {refreshToken} = req.cookies;
        try{
           await RefreshToken.deleteOne({token:refreshToken});
        }
        catch(e){
            return next(e);
        } 
        // Delete cookies
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        //2. reponse 
        res.status(200).json({user: null, auth : false })

    }
}


module.exports = authController;