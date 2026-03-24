const Quiz = require('../models/Quiz');

const isQuizOwner = async(req,res,next)=>{
    try {
        const quiz = await Quiz.findById(req.params.id);
        if(!quiz) return res.status(404).json({message:"Quiz not found"});
        const isOwner = quiz.createdBy.toString() === req.user.id;
        const isAdminOrAbove = ['admin','superadmin'].includes(req.user.role);
        if(!isOwner && !isAdminOrAbove){
            return res.status(401).json({message:"Access denied, You do not own the quiz"});
        }
        req.quiz= quiz;
        next();
    } catch (error) {
        res.status(500).json({message:"Server Error",error:error.message});
    }
};

module.exports = isQuizOwner;