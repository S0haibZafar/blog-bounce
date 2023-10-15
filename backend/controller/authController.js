const Joi = require('joi');
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const passwordExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const authController = {
    async login() { },
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

        try {
            const registerUSer = new User({
                username,
                name,
                email,
                password: encryptPassword
            });
            usr = await registerUSer.save();


        } catch (e) {
            return next(e);

        }

        //6. return reponse.
        return res.status(201).json({user: usr})
    }
}


module.exports = authController;