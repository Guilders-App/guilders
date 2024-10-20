import { signOutAction } from "@/app/actions";
import { Clipboard, InfoIcon, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export const Sidebar = () => {
  return (
    <aside className="bg-grey1 text-white w-64 min-h-screen p-4 shadow-lg border-r border-grey_border">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Koi</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center p-3 rounded-lg bg-grey_highlight"
            >
              <LayoutDashboard size={16} className="mr-4" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/insights"
              className="flex items-center p-3 rounded-lg hover:bg-grey_highlight"
            >
              <InfoIcon size={16} className="mr-4" />
              Insights
            </Link>
          </li>
          <li>
            <Link
              href="/reports"
              className="flex items-center p-3 rounded-lg hover:bg-grey_highlight"
            >
              <Clipboard size={16} className="mr-4" />
              Reports
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className="flex items-center p-3 rounded-lg hover:bg-grey_highlight"
            >
              <Settings size={16} className="mr-4" />
              Settings
            </Link>
          </li>
        </ul>
        <form action={signOutAction}>
          <Button type="submit" variant={"outline"}>
            Sign out
          </Button>
        </form>
      </nav>
    </aside>
  );
};
