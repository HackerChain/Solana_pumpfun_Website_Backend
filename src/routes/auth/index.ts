import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/User";
import logger from "../../logs/logger";
import config from "../../config";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    logger.info(`New user registered: ${username}`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({ message: "Registration failed" });
  }
});

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       logger.warn(`Login attempt failed for email: ${email}`);
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       logger.warn(`Invalid password for user: ${email}`);
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
//       expiresIn: "24h",
//     });
//     logger.info(`User logged in: ${email}`);
//     res.json({ token });
//   } catch (error: any) {
//     logger.error(`Login error: ${error.message}`);
//     res.status(500).json({ message: "Login failed" });
//   }
// });

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    // const adminEmail = config.adminEmail;
    // if (adminEmail !== email) {
    //   logger.warn(`Login attempt failed for email: ${email}`);
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }

    // const validPassword = password === config.adminPwd;
    // if (!validPassword) {
    //   logger.warn(`Invalid password for user: ${email}`);
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }

    // Generate JWT token
    const token = jwt.sign(
      { email: email },
      config.jwtSecret, // Add JWT_SECRET to your config
      { expiresIn: "24h" }
    );

    logger.info(`User logged in: ${email}`);
    res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (error: any) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;
