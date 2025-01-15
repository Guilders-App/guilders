"use client";

import { cn } from "@guilders/ui/cn";
import { motion } from "framer-motion";
import { Coffee, Home, Plane, ShoppingBag } from "lucide-react";

const categories = [
  {
    name: "Housing",
    icon: Home,
    spent: 1200,
    budget: 1500,
    color: "from-blue-500 to-blue-600",
  },
  {
    name: "Shopping",
    icon: ShoppingBag,
    spent: 450,
    budget: 500,
    color: "from-purple-500 to-purple-600",
  },
  {
    name: "Travel",
    icon: Plane,
    spent: 300,
    budget: 400,
    color: "from-green-500 to-green-600",
  },
  {
    name: "Food",
    icon: Coffee,
    spent: 280,
    budget: 350,
    color: "from-orange-500 to-orange-600",
  },
];

export function BudgetingVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center mb-24",
        className,
      )}
    >
      <div className="relative w-full max-w-md p-6">
        <div className="space-y-4">
          {categories.map((category, i) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </div>
                <span className="text-muted-foreground">
                  ${category.spent} / ${category.budget}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(category.spent / category.budget) * 100}%`,
                  }}
                  transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r",
                    category.color,
                  )}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
