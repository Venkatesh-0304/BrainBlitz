const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema({
    title:{
        type : String,
        required: true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    questions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Question',
    }]
},{timestamps:true})

module.exports = mongoose.model('Quiz',quizSchema);

