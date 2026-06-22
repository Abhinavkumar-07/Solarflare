export default function ForecastGauge({
  prediction = "C2.4",
  probability = 71
}) {
  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-yellow-400">
        {prediction}
      </div>

      <div className="text-slate-300 mt-2">
        {probability}% Probability
      </div>
    </div>
  );
}