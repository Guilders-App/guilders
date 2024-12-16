import { Card, CardContent, CardHeader, CardTitle } from "@guilders/ui/card";
import { NetWorthCategories } from "./categories";

export function CategoriesCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <NetWorthCategories />
      </CardContent>
    </Card>
  );
}
