import api from "./client";

export async function fetchCurrentProfile() {
  const { data } = await api.get("/profile");
  return data;
}

export async function saveStudentProfile(payload) {
  const { data } = await api.post("/profile/student", payload);
  return data.profile;
}

export async function saveCompanyProfile(payload) {
  const { data } = await api.post("/profile/company", payload);
  return data.profile;
}

export async function saveCollegeProfile(payload) {
  const { data } = await api.post("/profile/college", payload);
  return data.profile;
}
