import { Footer } from "../../components/footer";
import { Header } from "../../components/header";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-20 min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
