const Joi = require('joi');
const fs = require("fs");
const Blog = require('../models/blog');
const {BACKEND_SERVER_PATH} = require('../config/index');
const BlogDTO = require("../dto/blog")

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
    // async getAll(req, res, next) { },
    // async getById(req, res, next) { },
    // async update(req, res, next) { },
    // async delete(req, res, next) { },

}

module.exports = blogController;