import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AssetsTable } from "./assets-table";

export function AssetsCard() {
  return (
    <div className="bg-grey4 border border-grey_border shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-light">Assets</h2>
        <Button variant="secondary">
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <AssetsTable />
    </div>
  );
}
