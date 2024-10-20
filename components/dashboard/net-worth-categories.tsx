import { Category } from "@/utils/types";

const colorMap: Record<Category["name"], string> = {
  depository: "#3e84f7",
  brokerage: "#82d0fa",
  crypto: "#83d1ce",
  property: "#b263ea",
  vehicle: "#5f5fde",
  loan: "#eb4b63",
  creditcard: "#FF9F45",
};

const categoryDisplayNames: Record<Category["name"], string> = {
  depository: "Accounts",
  brokerage: "Stocks",
  crypto: "Crypto",
  property: "Real Estate",
  vehicle: "Cars",
  loan: "Loan",
  creditcard: "Credit Card",
};

const getCategoryColor = (categoryName: Category["name"]): string => {
  return colorMap[categoryName] || "#808080"; // Default to gray if category not found
};

const getCategoryDisplayName = (categoryName: Category["name"]): string => {
  return categoryDisplayNames[categoryName] || categoryName;
};

export function NetWorthCategories({ categories }: { categories: Category[] }) {
  categories = categories.filter((category) => category.value > 0);
  const totalSum = categories.reduce(
    (sum, category) => sum + category.value,
    0
  );

  return (
    <div>
      <h2 className="text-xl font-light text-white mb-4">Categories</h2>
      <div className="flex mb-2">
        {categories.map((category, index) => {
          const percentage = ((category.value / totalSum) * 100).toFixed(0);
          return (
            <div
              key={category.name}
              className={`h-4
                ${index > 0 ? "ml-0.5" : ""} 
                ${index < categories.length - 1 ? "mr-0.5" : ""}
                ${index == 0 ? "rounded-l-sm" : ""}
                ${index == categories.length - 1 ? "rounded-r-sm" : ""}
                `}
              style={{
                width: `${percentage}%`,
                backgroundColor: getCategoryColor(category.name),
              }}
            ></div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const percentage = ((category.value / totalSum) * 100).toFixed(0);
          return (
            <div key={category.name} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getCategoryColor(category.name) }}
              ></div>
              <span className="text-white text-sm font-light">
                {getCategoryDisplayName(category.name)}
              </span>
              <span className="text-gray-400 font-light text-sm ml-auto">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
