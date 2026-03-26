import api from "./client";

export async function fetchPosts() {
  const { data } = await api.get("/community/posts");
  return data.posts ?? [];
}

export async function createPost(content) {
  const { data } = await api.post("/community/posts", { content });
  return data.post;
}
