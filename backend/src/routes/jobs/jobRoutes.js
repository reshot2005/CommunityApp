import { Router } from "express";
import {
  applyToJob,
  cancelJobApplication,
  createJob,
  getAppliedJobs,
  getJobs
} from "../../controllers/jobs/jobController.js";
import authenticate from "../../middleware/authenticate.js";
import authorizeRoles from "../../middleware/authorizeRoles.js";
import {
  validateApplyToJob,
  validateCreateJob
} from "../../middleware/validateJobs.js";
import { USER_ROLES } from "../../utils/constants.js";

const router = Router();
const requireCompany = authorizeRoles(USER_ROLES.COMPANY);
const requireStudent = authorizeRoles(USER_ROLES.STUDENT);

router.get("/", authenticate, getJobs);
router.post("/", authenticate, requireCompany, validateCreateJob, createJob);
router.post("/apply", authenticate, requireStudent, validateApplyToJob, applyToJob);
router.post("/cancel-application", authenticate, requireStudent, cancelJobApplication);
router.post("/apply/:jobId/cancel", authenticate, requireStudent, cancelJobApplication);
router.delete("/apply/:jobId", authenticate, requireStudent, cancelJobApplication);
router.get("/applied", authenticate, requireStudent, getAppliedJobs);

export default router;
