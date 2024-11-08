import { ThemeSwitcher } from "../common/theme-switcher";
import { AddAccountButton } from "./add-account-button";

export const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="scroll-m-20 text-3xl font-extralight tracking-tight lg:text-4xl">
        Dashboard
      </h1>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <AddAccountButton />
      </div>
    </div>
  );
};
