export function validateProfileUpdatePayload(role, body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object"];
  }

  const errors = [];

  const validators = {
    student: () => {
      if ("skills" in body && !Array.isArray(body.skills)) {
        errors.push("skills must be an array");
      } else if ("skills" in body && body.skills.some((skill) => typeof skill !== "string")) {
        errors.push("skills must contain only strings");
      }

      if ("resumeUrl" in body && typeof body.resumeUrl !== "string") {
        errors.push("resumeUrl must be a string");
      } else if ("resumeUrl" in body && body.resumeUrl.trim().length > 500) {
        errors.push("resumeUrl must be at most 500 characters");
      }

      if ("projects" in body && !Array.isArray(body.projects)) {
        errors.push("projects must be an array");
      } else if ("projects" in body && body.projects.some((project) => typeof project !== "string")) {
        errors.push("projects must contain only strings");
      }
    },
    company: () => {
      if ("companyName" in body && typeof body.companyName !== "string") {
        errors.push("companyName must be a string");
      } else if ("companyName" in body && body.companyName.trim().length > 160) {
        errors.push("companyName must be at most 160 characters");
      }

      if ("description" in body && typeof body.description !== "string") {
        errors.push("description must be a string");
      } else if ("description" in body && body.description.trim().length > 3000) {
        errors.push("description must be at most 3000 characters");
      }
    },
    college: () => {
      if ("collegeName" in body && typeof body.collegeName !== "string") {
        errors.push("collegeName must be a string");
      } else if ("collegeName" in body && body.collegeName.trim().length > 160) {
        errors.push("collegeName must be at most 160 characters");
      }

      if ("location" in body && typeof body.location !== "string") {
        errors.push("location must be a string");
      } else if ("location" in body && body.location.trim().length > 160) {
        errors.push("location must be at most 160 characters");
      }
    }
  };

  const validate = validators[role];

  if (!validate) {
    return ["Unsupported role"];
  }

  validate();

  if (Object.keys(body).length === 0) {
    errors.push("At least one field is required");
  }

  return errors;
}
