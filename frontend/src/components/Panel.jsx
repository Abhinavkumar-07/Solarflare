export default function Panel({ title, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-white mb-4">
        {title}
      </h3>

      {children}
    </div>
  );
}