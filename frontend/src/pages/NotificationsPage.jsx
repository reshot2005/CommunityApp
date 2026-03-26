import Button from "../components/common/Button";
import Card from "../components/common/Card";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PageHeader from "../components/common/PageHeader";
import PageTransition from "../components/motion/PageTransition";
import { useNotifications } from "../context/NotificationContext";

function formatTimestamp(value) {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleString();
}

function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markUnread,
    markAllRead,
    deleteNotification
  } = useNotifications();

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        eyebrow="Alerts"
        title="Notifications"
        description="Stay on top of messages, job activity, and other account updates."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
        </p>
        <Button variant="secondary" onClick={markAllRead} disabled={notifications.length === 0 || unreadCount === 0}>
          Mark all as read
        </Button>
      </div>

      {isLoading ? <LoadingSpinner label="Loading notifications..." /> : null}

      {!isLoading && notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="New messages and job activity will appear here."
        />
      ) : null}

      {!isLoading ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`space-y-4 ${notification.readAt ? "border-slate-800" : "border-sky-400/30"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-white">{notification.title}</p>
                    {!notification.readAt ? (
                      <span className="rounded-full border border-sky-400/30 bg-sky-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{notification.body}</p>
                </div>
                <p className="text-xs text-slate-400">{formatTimestamp(notification.createdAt)}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {notification.type}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {notification.readAt ? (
                    <Button variant="ghost" onClick={() => markUnread(notification.id)}>
                      Mark as unread
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => markRead(notification.id)}>
                      Mark as read
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => deleteNotification(notification.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </PageTransition>
  );
}

export default NotificationsPage;
