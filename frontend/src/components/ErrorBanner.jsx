export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="bg-clay-soft border border-clay/30 text-clay text-sm rounded-md px-4 py-3 flex items-start justify-between gap-4"
    >
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="text-clay/70 hover:text-clay">
          ×
        </button>
      )}
    </div>
  );
}
