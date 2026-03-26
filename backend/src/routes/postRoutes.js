import { Router } from "express";
import { getPosts } from "../controllers/community/communityController.js";
import authenticate from "../middleware/authenticate.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/", authenticate, asyncHandler(getPosts));

export default router;
