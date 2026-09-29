import useOverlayStore from "@/hooks/useOverlayStore";

// Honest placeholder: there's no notification backend yet, so this just
// tells the user that clearly instead of a dead click or a fake unread
// count. Swap the empty state below for a real list once notifications are
// generated somewhere (e.g. budget alerts, AI-call failures).
const NotificationsModal = () => {
  const { isOpen, onClose, type } = useOverlayStore();

  if (!isOpen || type !== "NOTIFICATIONS_PANEL") return null;

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel-header">
          <div>
            <div className="modal-panel-title">Notifications</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="empty-state" style={{ padding: "1.5rem 1rem 0.5rem" }}>
          <div className="empty-icon">
            <i className="bi bi-bell" />
          </div>
          <h6>No notifications yet</h6>
          <p>You're all caught up — nothing needs your attention right now.</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
