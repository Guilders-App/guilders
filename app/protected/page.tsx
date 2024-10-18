import { NetWorthCard } from "@/components/net-worth-card";
import { PlusIcon } from "lucide-react";

export default async function ProtectedPage() {
  // const supabase = createClient();
  //
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="scroll-m-20 text-3xl font-extralight tracking-tight lg:text-4xl">
          Dashboard
        </h1>
        <button className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors flex items-center gap-2">
          <PlusIcon size={16} />
          Add
        </button>
      </div>
      <NetWorthCard />
    </div>
  );
}
