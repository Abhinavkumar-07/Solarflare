export default function StatusCard({
  title,
  value,
  color = "text-cyan-400"
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-slate-400 text-sm">{title}</p>

      <h2 className={`text-3xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}