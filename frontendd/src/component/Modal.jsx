import { useEffect, useRef } from "react";

export default function Modal({ children, onClose, label = "Dialog", className = "modal-overlay animate-fade-in" }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () => [...ref.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')].filter(el => el.getClientRects().length);
    (controls()[0] || ref.current).focus();
    function onKey(event) {
      if (event.key === "Escape") { event.stopPropagation(); closeRef.current?.(); }
      if (event.key !== "Tab") return;
      const items = controls();
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    const node = ref.current;
    node.addEventListener("keydown", onKey);
    return () => { node.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus(); };
  }, []);
  return <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className={className}>{children}</div>;
}
