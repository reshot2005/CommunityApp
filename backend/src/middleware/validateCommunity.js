import validateRequest from "./validateRequest.js";
import { validateCreatePostPayload } from "../validators/communityValidator.js";

export const validateCreatePost = validateRequest((req) =>
  validateCreatePostPayload(req.body)
);
