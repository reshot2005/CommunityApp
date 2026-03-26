import Profile from "../../models/Profile.js";
import User from "../../models/User.js";
import createHttpError from "../../utils/createHttpError.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const createOrUpdateStudentProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.upsertStudentProfile(req.user.id, req.body);

  return res.status(200).json({
    message: "Student profile saved",
    profile
  });
});

export const getStudentProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.getStudentProfileByUserId(req.params.id);

  if (!profile) {
    throw createHttpError(404, "Profile not found");
  }

  return res.status(200).json({
    profile
  });
});

export const getCurrentProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const profile = await Profile.findByUserId(req.user.id, req.user.role);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  return res.status(200).json({
    user,
    profile
  });
});

export const createOrUpdateCompanyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.upsertCompanyProfile(req.user.id, req.body);

  return res.status(200).json({
    message: "Company profile saved",
    profile
  });
});

export const createOrUpdateCollegeProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.upsertCollegeProfile(req.user.id, req.body);

  return res.status(200).json({
    message: "College profile saved",
    profile
  });
});
