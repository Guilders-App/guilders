import { AddAccountButton } from "./add-account-button";

export const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="scroll-m-20 text-3xl font-extralight tracking-tight lg:text-4xl">
        Dashboard
      </h1>
      <AddAccountButton />
    </div>
  );
};
