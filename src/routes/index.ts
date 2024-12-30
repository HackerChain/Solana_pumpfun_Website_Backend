import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";
import tokenRoutes from "./token";
import settingRoutes from "./setting";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/token", tokenRoutes);
router.use("/setting", settingRoutes)

export default router;
