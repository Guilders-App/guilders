import type { Metadata } from "next";
import { Footer } from "../../components/footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Guilders Legal",
    default: "Legal | Guilders",
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="container max-w-3xl py-10 md:py-16">{children}</main>
      <Footer />
    </>
  );
}
