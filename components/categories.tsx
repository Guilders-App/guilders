export type Category = {
  name: string;
  percentage: string;
  color: string;
};

export function Categories({ categories }: { categories: Category[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <div key={category.name} className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
          <span className="text-sm text-gray-400">{category.name}</span>
          <span className="text-sm text-gray-400 ml-1">
            ({category.percentage})
          </span>
        </div>
      ))}
    </div>
  );
}
