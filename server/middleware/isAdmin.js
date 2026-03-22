const isAdmin = (req,res,next)=>{
    if(req.user.role !== "admin"){
        return res.status(402).json({message: "Admin only"});
    }
    next();
}
module.exports = isAdmin;