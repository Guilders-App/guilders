import { ChartArea, ChartBar, Percent } from "lucide-react";

export default function Index() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground">
      <div className="flex justify-center mb-6">
        <span
          className="bg-emerald-500/10 text-emerald-500 text-sm px-4 py-1.5 rounded-full font-medium
          border border-emerald-500/20 shadow-sm shadow-emerald-500/10
          hover:bg-emerald-500/15 transition-all duration-300
          flex items-center gap-1.5"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Free while in beta
        </span>
      </div>
      {/* Hero Section */}
      <div className="w-full max-w-7xl px-4 pt-16 pb-20">
        <h1 className="text-7xl font-bold text-center mb-8 tracking-tight">
          Your Money,{" "}
          <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
            Reimagined
          </span>
        </h1>
        <p className="text-2xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          A powerful financial planning platform that helps you understand and
          grow your wealth. Built for the modern investor.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-16">
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Get Started
          </button>
          <button className="bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
            See How It Works
          </button>
        </div>

        {/* Stats Section */}
        <div className="flex justify-center gap-12 text-center border-y border-border py-12 my-20">
          <div>
            <div className="text-4xl font-bold mb-2">$10B+</div>
            <div className="text-muted-foreground">Assets Tracked</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50K+</div>
            <div className="text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">99%</div>
            <div className="text-muted-foreground">Customer Satisfaction</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-12 mt-20">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <ChartBar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Wealth Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">
              Deep insights into your portfolio with advanced analytics and
              performance tracking
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <Percent className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Tax Optimization</h3>
            <p className="text-muted-foreground leading-relaxed">
              Smart tax-loss harvesting and strategic recommendations to
              minimize your tax burden
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <ChartArea className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold">Retirement Planning</h3>
            <p className="text-muted-foreground leading-relaxed">
              Advanced modeling and forecasting to ensure you're on track for
              retirement
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
