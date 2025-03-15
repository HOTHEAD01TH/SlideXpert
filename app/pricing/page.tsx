"use client";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out SlideXpert",
      features: [
        "5 slides per presentation",
        "Basic AI generation",
        "Standard templates",
        "Email support",
        "Basic image quality",
        "1 user"
      ],
      buttonText: "Get Started",
      href: "/signup",
      highlighted: false
    },
    {
      name: "Pro",
      price: "$19",
      description: "Best for professionals",
      features: [
        "15 slides per presentation",
        "Advanced AI generation",
        "Premium templates",
        "Priority support",
        "HD image quality",
        "1 user"
      ],
      buttonText: "Coming Soon",
      href: "#waitlist",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For teams and organizations",
      features: [
        "Unlimited slides",
        "Custom AI models",
        "Custom templates",
        "24/7 support",
        "4K image quality",
        "Unlimited users"
      ],
      buttonText: "Contact Sales",
      href: "/contact",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-neutral-400">Choose the plan that's right for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-neutral-900/50 backdrop-blur-sm rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                plan.highlighted 
                  ? "border-purple-500 shadow-lg shadow-purple-500/20" 
                  : "border-neutral-800 hover:border-neutral-700"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-neutral-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-neutral-400">/month</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`block text-center py-3 px-6 rounded-lg transition-colors ${
                  plan.highlighted
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : "bg-neutral-800 hover:bg-neutral-700 text-white"
                }`}
              >
                {plan.buttonText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 