export default function GenomeHeatmap() {
  const cells = Array.from({ length: 64 });

  return (
    <div className="grid grid-cols-8 gap-2">
      {cells.map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded bg-cyan-500/50"
        />
      ))}
    </div>
  );
}