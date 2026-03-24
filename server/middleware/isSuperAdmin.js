const isSuperAdmin = (req,res,next)=>{
    if(req.user.role !== 'superadmin'){
        res.status(401).json({message:"Access denied, Super Admins only"});
    }
    next();
}

module.exports = isSuperAdmin;