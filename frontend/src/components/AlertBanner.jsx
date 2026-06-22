export default function AlertBanner({
  message = "No active solar flare alerts"
}) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-300">
      ⚠️ {message}
    </div>
  );
}