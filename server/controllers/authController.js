const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // ✅ added role

    const existUser = await User.findOne({ email });
    if (existUser) return res.status(400).json({ message: "user already exist" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({  // ✅ await + User.create + lowercase user
      name,
      email,
      password: hashedPassword,
      role: role || 'user'            // ✅ || instead of |
    });

    res.status(201).json({ message: "user created successfully" }); // ✅ status()

  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message }); // ✅ status()
  }
};

// Login               ✅ outside register function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("invalid username or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("invalid username or password");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

module.exports = { register, login }; // ✅ make sure names match here