const mongoose = require('mongoose');

const {Schema} = mongoose;

const commentSchema = new Schema({
    content: {type:String , require: true},
    blog: {type:mongoose.SchemaType.ObjectId , ref: 'blogs'},
    auhor: {type:mongoose.SchemaType.ObjectId , ref: 'users'},
},
 {timestamps: true}
);

module.exports = mongoose.model('Comment', commentSchema, 'Comments')