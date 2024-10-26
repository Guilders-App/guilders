import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccountStore } from "@/lib/store/accountStore";
import { ChangeIndicator } from "./change-indicator";

export function AssetsTable() {
  const { accounts } = useAccountStore();
  return (
    <Table className="border-collapse">
      <TableHeader>
        <TableRow className="border-none">
          <TableHead className="text-left">Account</TableHead>
          <TableHead className="w-[56px] text-center">Change</TableHead>
          <TableHead className="text-center">Cost</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => {
          const changePercentage =
            account.cost !== null
              ? ((account.value - account.cost) / account.cost) * 100
              : 0;

          return (
            <TableRow key={account.name} className="border-none">
              <TableCell className="font-medium p-2 text-left">
                {account.name}
              </TableCell>
              <TableCell className="p-2 text-center">
                <ChangeIndicator
                  change={{
                    value:
                      account.cost !== null ? account.value - account.cost : 0,
                    percentage: changePercentage,
                  }}
                />
              </TableCell>
              <TableCell className="p-2 text-center">
                {account.cost !== null ? account.cost : "N/A"}
              </TableCell>
              <TableCell className="text-right p-2">{account.value}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
