import env from "../../config/env.js";
import { loginUser, registerUser } from "../../services/authService.js";
import {
  completeOAuthLogin,
  getOAuthAuthorizationUrl,
  getOAuthProviderStatuses,
  loginWithMockOAuth
} from "../../services/oauthService.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const payload = await registerUser(req.body);

  return res.status(201).json({
    message: "User registered",
    ...payload
  });
});

export const login = asyncHandler(async (req, res) => {
  const payload = await loginUser(req.body);

  return res.status(200).json({
    message: "Login successful",
    ...payload
  });
});

export const startOAuth = asyncHandler(async (req, res) => {
  const provider = req.params.provider?.trim().toLowerCase();
  const role = (req.query.role || "student").trim().toLowerCase();
  const callbackUrl = new URL("/auth/oauth/callback", env.frontendUrl);

  try {
    const providerStatuses = getOAuthProviderStatuses();

    if (providerStatuses[provider]?.configured) {
      const authorizationUrl = getOAuthAuthorizationUrl(provider, role);
      return res.redirect(authorizationUrl);
    }

    if (providerStatuses[provider]?.mockEnabled) {
      const payload = await loginWithMockOAuth(provider, role);
      callbackUrl.searchParams.set("token", payload.token);
      callbackUrl.searchParams.set("user", JSON.stringify(payload.user));
      callbackUrl.searchParams.set("mode", "mock");
      return res.redirect(callbackUrl.toString());
    }

    throw new Error("Social login could not be started");
  } catch (error) {
    callbackUrl.searchParams.set(
      "error",
      error.message || "Social login could not be started"
    );
    return res.redirect(callbackUrl.toString());
  }
});

export const getOAuthProviders = asyncHandler(async (req, res) => {
  return res.status(200).json({
    providers: getOAuthProviderStatuses()
  });
});

export const completeOAuth = asyncHandler(async (req, res) => {
  const provider = req.params.provider?.trim().toLowerCase();
  const code = req.query.code?.trim();
  const state = req.query.state?.trim();
  const redirectUrl = new URL("/auth/oauth/callback", env.frontendUrl);

  try {
    const payload = await completeOAuthLogin({ provider, code, state });
    redirectUrl.searchParams.set("token", payload.token);
    redirectUrl.searchParams.set("user", JSON.stringify(payload.user));
  } catch (error) {
    redirectUrl.searchParams.set(
      "error",
      error.message || "Social login could not be completed"
    );
  }

  return res.redirect(redirectUrl.toString());
});
