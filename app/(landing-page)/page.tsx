export default function Index() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground px-4 pt-16">
      {/* Hero Section */}
      <h1 className="text-6xl font-bold text-center mb-6">
        Your Complete Financial Command Center
      </h1>
      <p className="text-xl text-center text-muted-foreground mb-8 max-w-2xl">
        Intelligent wealth tracking, AI-powered advice, and comprehensive
        financial planning - all in one elegant platform. Take control of your
        financial future.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-4 mb-12">
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
          Start for Free →
        </button>
        <button className="border border-primary text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary/10 transition-colors">
          Watch Demo
        </button>
      </div>

      {/* Key Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl">
        <div className="text-center p-6">
          <h3 className="text-xl font-bold mb-3">AI Financial Advisor</h3>
          <p className="text-muted-foreground">
            Get personalized guidance and insights powered by advanced AI
          </p>
        </div>
        <div className="text-center p-6">
          <h3 className="text-xl font-bold mb-3">Complete Asset Tracking</h3>
          <p className="text-muted-foreground">
            Monitor stocks, crypto, real estate, and more in real-time
          </p>
        </div>
        <div className="text-center p-6">
          <h3 className="text-xl font-bold mb-3">Smart Planning Tools</h3>
          <p className="text-muted-foreground">
            Plan your future with intelligent forecasting and scenarios
          </p>
        </div>
      </div>
    </main>
  );
}
