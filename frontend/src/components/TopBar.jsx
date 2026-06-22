export default function TopBar({ title }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-white">{title}</h1>

      <div className="text-green-400">
        ● Live
      </div>
    </div>
  );
}