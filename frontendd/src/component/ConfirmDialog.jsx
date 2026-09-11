import Modal from "./Modal";
export default function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <Modal onClose={onCancel} label="Confirm deletion">
      <div className="modal-content max-w-sm animate-fade-in-up">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 text-sm mb-6">{message}</p>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}