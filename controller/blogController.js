const Joi = require('joi');
const fs = require("fs");
const Blog = require('../models/blog');
const {BACKEND_SERVER_PATH} = require('../config/index');
const BlogDTO = require("../dto/blog")
const BlogDetailsDTO = require("../dto/blogDetails")

const mongodbIdPattran = /^[0-9a-fA-F]{24}$/;

const blogController = {
    async create(req, res, next) {
        //validate req body
        //handler photo  storage , save path onto db
        //add in db
        //response

        //client side photo -> base64 encoding string -> decode  -> store ->save photo's path into db
        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattran).required(),
            content: Joi.string().required(),
            photo: Joi.string().required(),
        })

        const {error} = createBlogSchema.validate(req.body)

        if (error) {
            return next(error);
        }

        const { title, author, content, photo } = req.body;

        //read as buffer
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64')
        //randing
        const imagePath = `${Date.now()}-${author}.png`;
        //save locally
        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        }
        catch (e) {
            return next(e);
        }

        //save blog in db
        let newBlog
        try {
             newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            })

            await newBlog.save(newBlog);
        }
        catch (error) {
            return next(error);
        }

        const blogDto = new BlogDTO(newBlog)

        return res.status(201).json({blog:blogDto});

    },
    async getAll(req, res, next) { 

        const blogs = [];
        try{
            const blogList= await Blog.find({});

            for(let i = 0; i < blogList.length; i++ ){
                const dto = new  BlogDTO(blogList[i])
                blogs.push(dto);
            }

            return res.status(200).json({blog:blogs });

        }
        catch(e){
            return next(e);
        }
    },
    async getById(req, res, next) { 

        const getBlogByIdSchema = Joi.object({
            id : Joi.string().regex(mongodbIdPattran).required()
        })

        const {error} = getBlogByIdSchema.validate(req.params);

        if(error){
            return next(error)
        }

        const blogId = req.params.id;
        
        let blog;
        try{
            blog= await Blog.findOne({_id: blogId}).populate('author');
        }
        catch(e){
            return next(e)
        }

         const blogdto = new BlogDetailsDTO(blog);

        return res.status(200).json({blog: blogdto})


    },
    async update(req, res, next) { 
        // validate 
        //if we update whole info then we need to delete previous photo and update. otherwise we do't delete photo
        
        const updateBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattran).required(),
            blogId: Joi.string().regex(mongodbIdPattran).required(),
            photo: Joi.string(),
        })

        const {error} = updateBlogSchema.validate(req.body)

        // if (error) {
        //     return next(error);
        // }

        const { title, content, author, blogId, photo } = req.body;

        //delete previous photo
        //other wise save news photo
        let blog;

        try{
            blog = await Blog.findOne({_id: blogId})
        }
        catch(e){
            return next(e)
        }

        if(photo){
            let previousPhoto =  blog.photoPath;

            previousPhoto = previousPhoto.split('/').at(-1);
            //delete photo
            fs.unlinkSync(`storage/${previousPhoto}`)

            //Now we save new photo
             //read as buffer
            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64')
            //randing
            const imagePath = `${Date.now()}-${author}.png`;
            //save locally
            try {
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            }
            catch (e) {
                return next(e);
            }   

            await Blog.updateOne({_id: blogId},{
                title, content, photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            })

        }else{
            //if we do't need to update photo only need to update content 
            await Blog.updateOne({_id: blogId}, {title, content});
        }
        return res.status(200).json({message : "blog updated!"});

    },
    // async delete(req, res, next) { },

}

module.exports = blogController;