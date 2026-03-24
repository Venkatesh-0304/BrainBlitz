const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    quizId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Quiz",
        required:true
    },
    score:{
        type:Number,
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    answers:[{
        questionId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Question",
        },
        answer:String,
        isCorrect:Boolean,
        answeredInTime:Boolean,
    }],
    timeTaken:{
        type: Number,
    },
    dateTaken:{
        type:Date,
        default: Date.now()
    },
},{timestamp:true});

module.exports = mongoose.model("Score",scoreSchema);