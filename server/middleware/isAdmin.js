const isAdmin = (req, res, next) => {
  const allowedRoles = ['admin', 'superadmin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = isAdmin;