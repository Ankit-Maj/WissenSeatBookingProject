const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const BATCH_LIMIT = 50;
const SQUAD_LIMIT = 15;

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const users = await User.find().select("batch squad");
    const stats = {
      BatchA: users.filter(u => u.batch === "BatchA").length,
      BatchB: users.filter(u => u.batch === "BatchB").length,
      Squad1: users.filter(u => u.squad === "Squad1").length,
      Squad2: users.filter(u => u.squad === "Squad2").length,
      Squad3: users.filter(u => u.squad === "Squad3").length,
      Squad4: users.filter(u => u.squad === "Squad4").length,
      Squad5: users.filter(u => u.squad === "Squad5").length,
    };
    res.json({ stats, limits: { batch: BATCH_LIMIT, squad: SQUAD_LIMIT } });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { username, email, password, batch, squad } = req.body;

    // Check capacity
    const batchCount = await User.countDocuments({ batch });
    if (batchCount >= BATCH_LIMIT) {
      return res.status(400).json({ msg: `${batch} is full (Limit: ${BATCH_LIMIT})` });
    }

    const squadCount = await User.countDocuments({ squad });
    if (squadCount >= SQUAD_LIMIT) {
      return res.status(400).json({ msg: `${squad} is full (Limit: ${SQUAD_LIMIT})` });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ msg: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      batch,
      squad
    });

    res.json({ msg: "User created" });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};