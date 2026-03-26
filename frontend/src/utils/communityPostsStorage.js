const COMMUNITY_POSTS_KEY = "communityPosts";

function getParsedPosts() {
  const rawValue = localStorage.getItem(COMMUNITY_POSTS_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(COMMUNITY_POSTS_KEY);
    return [];
  }
}

function setPosts(posts) {
  localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
}

export function getStoredCommunityPosts() {
  return getParsedPosts();
}

export function saveCommunityPost(post) {
  const currentPosts = getParsedPosts();
  const nextPosts = [post, ...currentPosts];
  setPosts(nextPosts);
  return nextPosts;
}
