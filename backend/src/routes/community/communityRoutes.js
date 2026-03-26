import { Router } from "express";
import {
  createPost,
  getPosts
} from "../../controllers/community/communityController.js";
import authenticate from "../../middleware/authenticate.js";
import { validateCreatePost } from "../../middleware/validateCommunity.js";

const router = Router();

router.get("/posts", authenticate, getPosts);
router.post("/posts", authenticate, validateCreatePost, createPost);

export default router;
