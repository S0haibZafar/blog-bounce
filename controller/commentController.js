const Joi = require('joi');
const Comment = require('../models/comment');
const commentDTO = require('../dto/comments');

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
    async getById(req, res, next) { 
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattran).required(),
        })

        const {error} = getByIdSchema.validate(req.params);

        if(error){
            return next(error);
        }

        const {id} = req.params;

        let comments;
        try{
            comments = await Comment.find({blog: id}).populate('author')

        }
        catch(e){
            return next(e);
        }

        let commentDto = []
        for(let i = 0; i < comments.length; i++){
            const obj = new commentDTO(comments[i]);
            commentDto.push(obj)

        }

        return res.status(200).json({data: commentDto})


    }
}

module.exports = commentController;