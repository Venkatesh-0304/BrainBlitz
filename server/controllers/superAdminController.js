const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Score = require('../models/Score');

// Get all users

const getAllUsers = async(req,res)=>{
    try {
        const users = await User.find().select('-password').sort({createdAt:-1});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message:"Server Error",error:error.message});
    }
};

// change user role
const changeUserRole = async(req,res)=>{
    try {
        const {role} = req.body;
        const validRoles = ['superadmin', 'admin', 'creator', 'player'];
        if(!validRoles.includes(role)){
            return res.status(400).json({message: "Invalid role"});
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            {new: true}).select('-passwrod');
            if(!user) return res.status(404).json({message: "User not found"});
            res.status(200).json({message: "Role Updated Successfully",user});
    } catch (error) {
        res.status(500).json({message:"Server Error",error:error.message});
    }
};

//delete user
const deleteUser = async(req,res)=>{
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user) return res.status(404).json({message:"User not found"});
        res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        res.status(500).json({message:"Server Error",error:error.message});

    }
};

//get platform stats
const getStats = async(req,res)=>{
    try {
        const totalUsers = await User.countDocuments();
        const totalQuizzes = await Quiz.countDocuments();
        const totalScore = await Score.countDocuments();
        const userByRole = await User.aggregate([
            {$group :{_id:'$role',count:{$sum:1}}}
        ]);
        res.status(200).json({
            totalUsers,
            totalQuizzes,
            totalScore,
            userByRole,
        });
    } catch (error) {
        res.status(500).json({message:"Server Error",error:error.message});
    }
}

module.exports = { getAllUsers, changeUserRole, deleteUser, getStats };