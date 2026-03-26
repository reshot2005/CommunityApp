import { useEffect, useState } from "react";
import { createPost, fetchPosts } from "../api/posts";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PageHeader from "../components/common/PageHeader";
import PageTransition from "../components/motion/PageTransition";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getStoredCommunityPosts,
  saveCommunityPost
} from "../utils/communityPostsStorage";

function CommunityPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true);
        const apiPosts = await fetchPosts().catch(() => []);
        const storedPosts = getStoredCommunityPosts();
        const mergedPosts = [...storedPosts];

        apiPosts.forEach((post) => {
          if (!mergedPosts.some((currentPost) => currentPost.id === post.id)) {
            mergedPosts.push(post);
          }
        });

        setPosts(mergedPosts);
      } catch {
        showToast("Failed to load posts", "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, [showToast]);

  async function handleCreatePost() {
    if (!content.trim()) {
      showToast("Post content is required", "error");
      return;
    }

    try {
      const post = await createPost(content);
      setPosts((current) => [post, ...current]);
      setContent("");
      showToast("Post published", "success");
    } catch {
      const fallbackPost = {
        id: crypto.randomUUID(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        authorName: user?.name || "Community Member",
        authorRole: user?.role || "member",
        isLocalPost: true
      };

      saveCommunityPost(fallbackPost);
      setPosts((current) => [fallbackPost, ...current]);
      setContent("");
      showToast("Post published locally", "success");
    }
  }

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        eyebrow="Community Feed"
        title="Share updates and join discussions."
        description="Post announcements, ask questions, and stay connected with students, companies, and colleges."
      />

      <Card>
        <label htmlFor="post" className="mb-3 block text-sm font-medium text-gray-100">
          Create a post
        </label>
        <textarea
          id="post"
          rows="4"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Share something with the community..."
          className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-brand-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]"
        />
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-400">Posting as {user?.name || "Community Member"}</p>
          <Button type="button" onClick={handleCreatePost}>
            Post
          </Button>
        </div>
      </Card>

      <div className="space-y-5">
        {isLoading ? <LoadingSpinner label="Loading posts..." /> : null}
        {!isLoading && posts.length === 0 ? (
          <EmptyState
            title="No community posts"
            description="Publish the first update to start the feed."
          />
        ) : null}

        {!isLoading
          ? posts.map((post) => (
              <Card key={post.id} className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {post.authorName || "Community Member"}
                    </h2>
                    <p className="mt-1 inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
                      {post.authorRole || "member"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"}
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-200">{post.content}</p>
                {post.isLocalPost ? (
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-300">
                    Local Post
                  </p>
                ) : null}
              </Card>
            ))
          : null}
      </div>
    </PageTransition>
  );
}

export default CommunityPage;
