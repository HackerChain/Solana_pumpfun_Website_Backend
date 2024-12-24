import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";
import tokenRoutes from "./token";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/token", tokenRoutes);

export default router;
