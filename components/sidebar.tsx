import Link from "next/link";

export const Sidebar = () => {
  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">neters</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center p-2 rounded-lg bg-gray-800"
            >
              <span className="mr-3">◫</span>
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/insights"
              className="flex items-center p-2 rounded-lg hover:bg-gray-800"
            >
              <span className="mr-3">◎</span>
              Insights
            </Link>
          </li>
          <li>
            <Link
              href="/reports"
              className="flex items-center p-2 rounded-lg hover:bg-gray-800"
            >
              <span className="mr-3">☰</span>
              Reports
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className="flex items-center p-2 rounded-lg hover:bg-gray-800"
            >
              <span className="mr-3">⚙</span>
              Settings
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto pt-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-4">
          <h3 className="font-bold mb-2">Get Pro</h3>
          <p className="text-sm mb-2">
            Unlimited assets, insight report exports
          </p>
          <button className="bg-white text-purple-600 px-4 py-2 rounded text-sm font-bold">
            Start Now • $50/y →
          </button>
        </div>
      </div>
    </aside>
  );
};
