import { Metadata } from "next/types";

export const defaultMetadata: Metadata = {
  title: {
    default: "Guilders - AI-Powered Personal Finance Management",
    template: "%s | Guilders",
  },
  description:
    "Take control of your finances with Guilders. Track accounts, investments, and spending all in one place.",
  keywords: [
    "personal finance",
    "money management",
    "investment tracking",
    "budgeting",
    "financial planning",
    "net worth tracking",
    "financial dashboard",
  ],
  authors: [{ name: "Guilders" }],
  creator: "Guilders",
  publisher: "Guilders",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/app/favicon.ico",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    title: "Guilders - AI-Powered Personal Finance Management",
    description:
      "Take control of your finances with Guilders. Connect your accounts, track investments, and manage your money smarter.",
    type: "website",
    url: "https://guilders.app",
    images: [{ url: "/assets/logo/cover.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guilders - AI-Powered Personal Finance Management",
    description:
      "Take control of your finances with Guilders. Connect your accounts, track investments, and manage your money smarter.",
    images: ["/assets/logo/cover.jpg"],
  },
};
