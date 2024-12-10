"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@/lib/db/types";
import { convertToUserCurrency } from "@/lib/utils/financial";
import { useMemo } from "react";
import {
  Layer,
  Rectangle,
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from "recharts";

interface TransactionsSankeyProps {
  transactions: Transaction[] | undefined;
  isLoading: boolean;
  userCurrency: string;
}

interface SankeyNode {
  name: string;
  value?: number;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color?: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Color palette for links
const COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f97316", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#14b8a6", // teal
  "#f43f5e", // rose
  "#a855f7", // violet
];

// Custom node component with value annotation
function CustomNode({
  x,
  y,
  width,
  height,
  index,
  payload,
  userCurrency,
}: any) {
  const isIncome = payload.name.includes("Income");

  const formattedValue = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: userCurrency,
    maximumFractionDigits: 0,
  }).format(Math.round(payload.value));

  // Format the category name properly
  const categoryName = payload.name
    .replace(/ \(Income\)$/, "")
    .replace(/ \(Expense\)$/, "");

  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isIncome ? "#22c55e" : "#ef4444"}
        fillOpacity={0.6}
      />
      <text
        textAnchor={isIncome ? "end" : "start"}
        x={isIncome ? x - 6 : x + width + 6}
        y={y + height / 2}
        fontSize="12"
        stroke="#333"
      >
        {categoryName}
      </text>
      <text
        textAnchor={isIncome ? "end" : "start"}
        x={isIncome ? x - 6 : x + width + 6}
        y={y + height / 2 + 13}
        fontSize="10"
        stroke="#333"
        strokeOpacity="0.5"
      >
        {formattedValue}
      </text>
    </Layer>
  );
}

// Custom link component
function CustomLink({
  sourceX,
  sourceY,
  sourceControlX,
  targetX,
  targetY,
  targetControlX,
  linkWidth,
  payload,
}: any) {
  return (
    <path
      d={`
        M${sourceX},${sourceY}
        C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
      `}
      fill="none"
      stroke={payload.color}
      strokeWidth={linkWidth}
      strokeOpacity={0.3}
      onMouseEnter={(e) => {
        e.currentTarget.style.strokeOpacity = "0.5";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.strokeOpacity = "0.3";
      }}
    />
  );
}

export function TransactionsSankey({
  transactions,
  isLoading,
  userCurrency,
}: TransactionsSankeyProps) {
  const sankeyData = useMemo<SankeyData>(() => {
    if (!transactions) return { nodes: [], links: [] };

    // Separate income and expense transactions
    const incomeCategories = new Set<string>();
    const expenseCategories = new Set<string>();

    transactions.forEach((t) => {
      if (t.amount > 0) {
        incomeCategories.add(t.category);
      } else {
        expenseCategories.add(t.category);
      }
    });

    // Convert sets to arrays for mapping
    const incomeArray = Array.from(incomeCategories);
    const expenseArray = Array.from(expenseCategories);

    // Calculate total values for each category
    const categoryTotals = new Map<string, number>();
    transactions.forEach((t) => {
      const amount = Math.abs(
        convertToUserCurrency(t.amount, t.currency, [], userCurrency)
      );
      const key = `${t.category} (${t.amount > 0 ? "Income" : "Expense"})`;
      categoryTotals.set(key, (categoryTotals.get(key) || 0) + amount);
    });

    // Create nodes array: income categories -> Income node -> expense categories
    const nodes: SankeyNode[] = [
      ...incomeArray.map(
        (cat): SankeyNode => ({
          name: `${cat} (Income)`,
          value: categoryTotals.get(`${cat} (Income)`) || 0,
        })
      ),
      { name: "Income", value: 0 }, // Central income node
      ...expenseArray.map(
        (cat): SankeyNode => ({
          name: `${cat} (Expense)`,
          value: categoryTotals.get(`${cat} (Expense)`) || 0,
        })
      ),
    ];

    // Create indices maps
    const incomeIndices = new Map(
      incomeArray.map((cat, index) => [cat, index])
    );
    const incomeNodeIndex = incomeArray.length; // Index of the central "Income" node
    const expenseIndices = new Map(
      expenseArray.map((cat, index) => [cat, index + incomeArray.length + 1])
    );

    const links: SankeyLink[] = [];
    let colorIndex = 0;

    // First set of links: from income categories to central Income node
    incomeArray.forEach((incomeCat) => {
      const incomeForCategory = transactions
        .filter((t) => t.amount > 0 && t.category === incomeCat)
        .reduce(
          (sum, t) =>
            sum + convertToUserCurrency(t.amount, t.currency, [], userCurrency),
          0
        );

      if (incomeForCategory > 0) {
        links.push({
          source: incomeIndices.get(incomeCat)!,
          target: incomeNodeIndex,
          value: incomeForCategory,
          color: COLORS[colorIndex % COLORS.length],
        });
        colorIndex++;
      }
    });

    // Second set of links: from central Income node to expense categories
    expenseArray.forEach((expenseCat) => {
      const expenseForCategory = Math.abs(
        transactions
          .filter((t) => t.amount < 0 && t.category === expenseCat)
          .reduce(
            (sum, t) =>
              sum +
              convertToUserCurrency(t.amount, t.currency, [], userCurrency),
            0
          )
      );

      if (expenseForCategory > 0) {
        links.push({
          source: incomeNodeIndex,
          target: expenseIndices.get(expenseCat)!,
          value: expenseForCategory,
          color: COLORS[colorIndex % COLORS.length],
        });
        colorIndex++;
      }
    });

    return { nodes, links };
  }, [transactions, userCurrency]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!transactions?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow</CardTitle>
      </CardHeader>
      <CardContent className="pb-8">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={sankeyData}
              node={<CustomNode userCurrency={userCurrency} />}
              link={<CustomLink />}
              nodePadding={20}
              nodeWidth={10}
              margin={{ top: 10, right: 100, bottom: 10, left: 100 }}
            >
              <Tooltip />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
