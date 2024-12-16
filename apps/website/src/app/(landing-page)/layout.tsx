import { Footer } from "../../components/footer";
import { Header } from "../../components/header";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col items-center">
      <Header />
      <div className="flex flex-col gap-20 max-w-5xl p-5 mt-20 min-h-screen">
        {children}
      </div>
      <Footer />
    </main>
  );
}
