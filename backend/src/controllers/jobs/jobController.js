import Application from "../../models/Application.js";
import Job from "../../models/Job.js";
import User from "../../models/User.js";
import {
  createNotification,
  NOTIFICATION_TYPES
} from "../../services/notificationService.js";
import createHttpError from "../../utils/createHttpError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { USER_ROLES } from "../../utils/constants.js";

export const createJob = asyncHandler(async (req, res) => {
  const title = req.body.title?.trim();
  const description = req.body.description?.trim();
  const location = req.body.location?.trim();
  const salary = req.body.salary ?? null;

  if (!title || !description || !location) {
    throw createHttpError(400, "title, description, and location are required");
  }

  const job = await Job.create({
    companyId: req.user.id,
    title,
    description,
    location,
    salary
  });

  return res.status(201).json({
    message: "Job created",
    job
  });
});

export const getJobs = asyncHandler(async (req, res) => {
  const jobs =
    req.user.role === USER_ROLES.COMPANY
      ? await Job.findByCompanyId(req.user.id)
      : await Job.findAll();
  return res.status(200).json({ jobs });
});

export const applyToJob = asyncHandler(async (req, res) => {
  const jobId = req.body.jobId?.trim();

  if (!jobId) {
    throw createHttpError(400, "jobId is required");
  }

  const application = await Application.create({
    jobId,
    studentId: req.user.id
  });
  const [job, student] = await Promise.all([
    Job.findById(jobId),
    User.findById(req.user.id)
  ]);

  if (job?.companyId && job.companyId !== req.user.id) {
    await createNotification({
      userId: job.companyId,
      actorId: req.user.id,
      type: NOTIFICATION_TYPES.JOB_APPLICATION_RECEIVED,
      title: `New application for ${job.title}`,
      body: `${student?.name || "A student"} applied to your job posting.`,
      data: {
        applicationId: application.id,
        jobId: job.id,
        studentId: req.user.id
      },
      emailSubject: `New application for ${job.title}`,
      emailText: `${student?.name || "A student"} applied to your job "${job.title}".`,
      emailHtml: `<p><strong>${student?.name || "A student"}</strong> applied to your job <strong>${job.title}</strong>.</p>`
    });
  }

  return res.status(201).json({
    message: "Application submitted",
    application
  });
});

export const cancelJobApplication = asyncHandler(async (req, res) => {
  const jobId = (req.params.jobId || req.body.jobId || "").trim();

  if (!jobId) {
    throw createHttpError(400, "jobId is required");
  }

  const application = await Application.deleteByJobIdAndStudentId({
    jobId,
    studentId: req.user.id
  });

  return res.status(200).json({
    message: "Application cancelled",
    application
  });
});

export const getAppliedJobs = asyncHandler(async (req, res) => {
  const applications = await Application.findAppliedJobsByStudentId(req.user.id);
  return res.status(200).json({ applications });
});
