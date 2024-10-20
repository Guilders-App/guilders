export function TopNetWorth({ percentage }: { percentage: number }) {
  return (
    <div>
      <h2 className="text-lg font-light text-gray-400 mb-2">
        Top {(100 - percentage).toFixed(1)}% Net Worth in Poland
      </h2>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div
          className="bg-yellow-400 h-3 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
