const isCreator = (req,res,next)=>{
    const allowedRoles = ['creator','admin','superadmin'];
    if(!allowedRoles.includes(req.user.role)){
        res.status(401).json({message:"Access denied, Creators only"});
    }
    next();
}

module.exports = isCreator;