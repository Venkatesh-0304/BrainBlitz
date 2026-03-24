const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const isSuperAdmin= require('../middleware/isSuperAdmin');

const {
    getAllUsers,
    changeUserRole,
    deleteUser,
    getStats,
} = require('../controllers/superAdminController');

router.use(verifyToken,isSuperAdmin);

router.get('/stats',getStats);
router.get('/users',getAllUsers);
router.put('/user/:id/role',changeUserRole);
router.delete('/user/:id',deleteUser)

module.exports = router;