import { Router } from "express";
import {
  completeOAuth,
  getOAuthProviders,
  login,
  register,
  startOAuth
} from "../../controllers/auth/authController.js";
import {
  validateLogin,
  validateRegister
} from "../../middleware/validateAuth.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/oauth/providers", getOAuthProviders);
router.get("/oauth/:provider/start", startOAuth);
router.get("/oauth/:provider/callback", completeOAuth);

export default router;
