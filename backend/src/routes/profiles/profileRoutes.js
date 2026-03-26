import { Router } from "express";
import {
  createOrUpdateCollegeProfile,
  createOrUpdateCompanyProfile,
  createOrUpdateStudentProfile,
  getCurrentProfile,
  getStudentProfile
} from "../../controllers/profiles/profileController.js";
import authenticate from "../../middleware/authenticate.js";
import authorizeRoles from "../../middleware/authorizeRoles.js";
import { validateProfileUpdate } from "../../middleware/validateProfile.js";
import { USER_ROLES } from "../../utils/constants.js";

const router = Router();

router.get("/", authenticate, getCurrentProfile);
router.post(
  "/student",
  authenticate,
  authorizeRoles(USER_ROLES.STUDENT),
  validateProfileUpdate,
  createOrUpdateStudentProfile
);
router.get("/student/:id", getStudentProfile);
router.post(
  "/company",
  authenticate,
  authorizeRoles(USER_ROLES.COMPANY),
  validateProfileUpdate,
  createOrUpdateCompanyProfile
);
router.post(
  "/college",
  authenticate,
  authorizeRoles(USER_ROLES.COLLEGE),
  validateProfileUpdate,
  createOrUpdateCollegeProfile
);

export default router;
