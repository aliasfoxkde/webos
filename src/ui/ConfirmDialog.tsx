import React from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div
        className="relative z-10 w-80 rounded-xl border p-6 shadow-2xl"
        style={{
          backgroundColor: 'var(--os-bg-secondary)',
          borderColor: 'var(--os-border)',
        }}
      >
        <h3 className="text-sm font-semibold text-[var(--os-text-primary)]">
          {title}
        </h3>
        <p className="mt-2 text-xs text-[var(--os-text-secondary)]">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-lg border px-3 py-1.5 text-xs"
            style={{
              borderColor: 'var(--os-border)',
              color: 'var(--os-text-secondary)',
            }}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{
              backgroundColor: danger ? '#ef4444' : 'var(--os-accent)',
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
