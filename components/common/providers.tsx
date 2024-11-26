"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { TrpcProvider } from "./trcp-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <TrpcProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </TrpcProvider>
  );
};
