import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import authRoutes from "./auth/authRoutes.js";
import postRoutes from "./postRoutes.js";
import profileRoutes from "./profiles/profileRoutes.js";
import jobRoutes from "./jobs/jobRoutes.js";
import communityRoutes from "./community/communityRoutes.js";
import messageRoutes from "./messages/messageRoutes.js";
import notificationRoutes from "./notifications/notificationRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/profile", profileRoutes);
router.use("/jobs", jobRoutes);
router.use("/community", communityRoutes);
router.use("/messages", messageRoutes);
router.use("/notifications", notificationRoutes);

export default router;
