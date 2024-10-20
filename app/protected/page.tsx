import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NetWorthCard } from "@/components/dashboard/net-worth-card";

export default async function ProtectedPage() {
  // const supabase = createClient();
  //
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col">
      <DashboardHeader />
      <NetWorthCard />
    </div>
  );
}
