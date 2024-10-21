import { Account } from "@/utils/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ChangeIndicator } from "./change-indicator";

export function AssetsTable({ accounts }: { accounts: Account[] }) {
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
            ((account.value - account.cost) / account.cost) * 100;

          return (
            <TableRow key={account.name} className="border-none">
              <TableCell className="font-medium p-2 text-left">
                {account.name}
              </TableCell>
              <TableCell className="p-2 text-center">
                <ChangeIndicator
                  change={{
                    value: account.value - account.cost,
                    percentage: changePercentage,
                  }}
                />
              </TableCell>
              <TableCell className="p-2 text-center">{account.cost}</TableCell>
              <TableCell className="text-right p-2">{account.value}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
