import { AlertTriangle, X } from "lucide-react";
import "./ConfirmDeleteModal.css";
export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item?",
  message = "This action cannot be undone.",
  itemName = "",
  dangerText = "Delete",
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-header">
          <div className="confirm-icon">
            <AlertTriangle size={22} />
          </div>
          <h3>{title}</h3>
        </div>

        <div className="confirm-body">
          <p>
            {message}
            {itemName && <strong> {itemName}</strong>}
          </p>
        </div>

        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-btn danger" onClick={onConfirm}>
            {dangerText}
          </button>
        </div>
      </div>
    </div>
  );
}
