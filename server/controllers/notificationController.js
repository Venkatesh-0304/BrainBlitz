const Notification = require('../models/Notification')

//Get all notifications for logged in user

const getNotifications = async(req,res)=>{
    try {
        const notifications = await Notification.find({to:req.user.id}).populate('from','name').populate('quizId','title').sort({createdAt: -1});
        res.status(200).json(notifications);
    } catch (error) {
        res.status((500).json({message:"Server Error",error:error.message}));
    }
};

// mark notification as read

const markAsRead = async(req,res)=>{
    try {
        await Notification.findByIdAndUpdate(req.params.id,{read:ture});
        res.status(200).json({message:"Marked as read"});
    } catch (error) {
        res.status(500).json({message:"Server Error",error:error.message});       
    }
}

// mark all as read 

const markAllRead = async(req,res)=>{
    try {
        await Notification.updateMany({to:req.user.id},{read:true});
        res.status(200).json({message:"All marked as read"});
    } catch (error) {
        res.status(500).json({message:"Server Error",error:error.message});
    }
};

module.exports = { getNotifications, markAsRead, markAllRead};