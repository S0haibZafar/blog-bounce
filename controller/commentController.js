const Joi = require('joi');
const Comment = require('../models/comment');

const mongodbIdPattran = /^[0-9a-fA-F]{24}$/;

const commentController = {
    async create(req, res, next) {

        const createCommentSchema = Joi.object({
            content: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattran).required(),
            blog: Joi.string().regex(mongodbIdPattran).required(),
        })

        const { error } = createCommentSchema.validate(req.body);

        if (error) {
            return next(error)
        }

        const { content, author, blog } = req.body;

        try {
            const commentObj = new Comment({
                content, author, blog
            })

            await commentObj.save();

        }
        catch (e) {
            return next(e)
        }

        return res.status(200).json({message: "Comment Created!"})

    },
    async getById(req, res, next) { }
}

module.exports = commentController;