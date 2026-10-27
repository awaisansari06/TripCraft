import React from 'react';
import { Brain, Plane, Map } from 'lucide-react';

function HowItWorks() {
    const steps = [
        {
            icon: <Brain className="w-8 h-8 text-white" />,
            title: "Tell us your trip idea",
            desc: "Just share a few details about where you want to go and what you love.",
            color: "bg-blue-500"
        },
        {
            icon: <Plane className="w-8 h-8 text-white" />,
            title: "Get itinerary & budget",
            desc: "Our AI builds a custom itinerary, suggests hotels, and estimates costs.",
            color: "bg-purple-500"
        },
        {
            icon: <Map className="w-8 h-8 text-white" />,
            title: "View map + save plan",
            desc: "Visualize your trip on an interactive map and save it for later.",
            color: "bg-green-500"
        }
    ];

    return (
        <section className="py-20 bg-white/60 backdrop-blur-sm dark:bg-black/20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-4">How it Works</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Planning your dream trip has never been easier. Just 3 simple steps to get started.
                    </p>
                </div>

                <div className="relative">
                    {/* Visual Connector Line */}
                    <svg className="absolute top-16 left-0 w-full h-24 hidden md:block z-0 pointer-events-none opacity-80" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="connectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                        <path d="M10 10 C 30 20, 70 0, 90 10" stroke="url(#connectorGradient)" strokeWidth="3" strokeDasharray="6 6" fill="none" />
                    </svg>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center text-center p-6 glass hover:shadow-xl hover:-translate-y-1 hover:border-orange-300 transition-all relative z-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${step.color}`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;
