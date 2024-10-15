import Image from "next/image";

export default function Index() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-4 pt-16">
      <h1 className="text-5xl font-bold text-center mb-4">
        Track all your assets
        <br />
        from one place
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Real-time data for Global Bank Accounts, Stocks,
        <br />
        Investments, Crypto, DeFi, Physical Assets
      </p>
      <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
        Start Now →
      </button>
      <div className="mt-12 relative w-full max-w-4xl aspect-video">
        <Image
          src="/assets/hero.png"
          alt="Asset tracking visualization"
          layout="fill"
          objectFit="contain"
        />
      </div>
    </main>
  );
}
