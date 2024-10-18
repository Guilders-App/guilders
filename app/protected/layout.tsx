import { Sidebar } from "@/components/sidebar";
import React from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-grey3 flex">
      <Sidebar />
      <main className="flex-1 m-12">{children}</main>
    </div>
  );
};

export default ProtectedLayout;
