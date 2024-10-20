export function NetWorthDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-baseline mb-4">
      <span className="text-2xl font-light text-gray-400">$</span>
      <span className="text-4xl font-normal font-mono tracking-tight">
        {value.toLocaleString()}
      </span>
    </div>
  );
}
