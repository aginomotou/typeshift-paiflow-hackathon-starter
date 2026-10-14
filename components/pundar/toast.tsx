"use client";
import { useEffect } from "react";

export type ToastTone = "ok" | "back" | "bad";
export type ToastMessage = { id: string; tone: ToastTone; title: string; body: string };

const ICON: Record<ToastTone, React.ReactNode> = {
  ok: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  // A return arrow: the padala came back instead of splitting.
  back: <path d="M9 7L4 12l5 5M4 12h11a5 5 0 0 1 0 10h-2" />,
  bad: <path d="M7 7l10 10M17 7L7 17" />,
};

// A pop-up for a finished padala. Announced politely for success or a return,
// assertively for a failure. Closes itself after 8 s or on "Isara".
export function Toast({
  message,
  onClose,
}: {
  message: ToastMessage | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div
      key={message.id}
      className={`toast toast-${message.tone}`}
      role={message.tone === "bad" ? "alert" : "status"}
    >
      <span className="toast-icon" aria-hidden>
        <svg viewBox="0 0 24 24">{ICON[message.tone]}</svg>
      </span>
      <div className="toast-text">
        <p className="toast-title">{message.title}</p>
        <p className="toast-body">{message.body}</p>
      </div>
      <button type="button" className="toast-close" onClick={onClose}>
        Isara
      </button>
    </div>
  );
}
