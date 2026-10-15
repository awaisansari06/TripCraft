"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Globe2, Landmark, Plane, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GradientButton from "@/components/ui/gradient-button";
import AnimatedBorder from "@/components/ui/animated-border";
import FloatingIcons from "@/components/hero/FloatingIcons";
import FacePile from "@/components/ui/face-pile";
import { useTypewriter } from 'react-simple-typewriter';
import { TRIP_SUGGESTIONS } from '@/lib/trip-suggestions';

const suggestions = [
    {
        title: "Create New Trip",
        icon: <Globe2 className="h-5 w-5 text-blue-400" />,
    },
    {
        title: "Inspire me where to go",
        icon: <Plane className="h-5 w-5 text-green-500" />,
    },
    {
        title: "Discover Hidden gems",
        icon: <Landmark className="h-5 w-5 text-orange-500" />,
    },
    {
        title: "Adventure Destination",
        icon: <Globe2 className="h-5 w-5 text-yellow-600" />,
    },
];

function Hero() {

    const [userInput, setUserInput] = useState<string>("");
    const { user } = useUser();
    const router = useRouter();

    const [text] = useTypewriter({
        words: TRIP_SUGGESTIONS,
        loop: true,
        delaySpeed: 2000,
    });

    const onSelectOption = (option: string) => {
        setUserInput(option);
    }

    const onSend = () => {
        if (!user) {
            router.push('/sign-in');
            return;
        }
        //Navigate to Create Trip Planner Web Page
        if (userInput) {
            router.push('/create-new-trip?query=' + userInput);
        }
        else {
            router.push('/create-new-trip');
        }
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="relative flex justify-center bg-transparent pt-24 pb-12 overflow-hidden">
            <FloatingIcons />

            {/* Content */}
            <div className="relative z-10 flex w-full max-w-3xl flex-col items-center space-y-6 text-center px-4">
                <h1 className="text-xl font-bold md:text-5xl text-neutral-800 dark:text-white">
                    Hey, I&apos;m your personal
                    <span className="text-primary"> Trip Planner</span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-300">
                    Tell me what you want, and I&apos;ll handle the rest: Flights, Hotels, Trip
                    Planner - all in seconds
                </p>

                {/* Input Box */}
                <div className="w-full flex flex-col items-center mt-6">
                    <AnimatedBorder className="w-full shadow-lg hover:shadow-xl transition focus-within:ring-2 focus-within:ring-orange-400/50 rounded-3xl">
                        <div className="relative p-2 glass-strong rounded-3xl">
                            <Textarea
                                placeholder={text}
                                className="min-h-[70px] w-full resize-none border-none bg-transparent shadow-none focus-visible:ring-0 text-lg p-3"
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                value={userInput}
                            />
                            <Button size={"icon"} className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 rounded-xl w-12 h-12 transition-transform hover:scale-110" onClick={() => onSend()}>
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </AnimatedBorder>

                    {/* Input Label */}
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                        Try: <span className="text-gray-600 dark:text-gray-400">&quot;Goa trip for 3 days under ₹20k&quot;</span>
                    </p>

                    {/* Primary CTA Button */}
                    <div className="mt-6 relative group">
                        <div className="absolute -inset-1 bg-linear-to-r from-orange-400 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                        <GradientButton
                            onClick={() => onSend()}
                            className="relative rounded-full px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                        >
                            Start Planning Free →
                        </GradientButton>
                    </div>
                </div>

                {/* Suggestion list */}
                <div className="flex gap-3 mt-8 flex-wrap justify-center w-full max-w-2xl px-4">
                    {suggestions.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => onSelectOption(item.title)}
                            className="h-10 px-6 flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md hover:bg-white/70 hover:scale-[1.03] hover:text-primary hover:border-primary/50 active:scale-95 transition-all duration-300"
                        >
                            {item.icon}
                            <span>{item.title}</span>
                        </button>
                    ))}
                </div>

                {/* Trust / Stats */}
                <div className="flex flex-col items-center gap-6 mt-6">
                    <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300 md:gap-16 md:text-base">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">10K+</span>
                            <span className="text-gray-500 dark:text-gray-400">Trips planned</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">1K+</span>
                            <span className="text-gray-500 dark:text-gray-400">Happy Users</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">Instant</span>
                            <span className="text-gray-500 dark:text-gray-400">AI Generation</span>
                        </div>
                    </div>

                    {/* Trust Strip */}
                    <div className="flex flex-wrap gap-4 justify-center text-xs md:text-sm text-gray-400 font-medium">
                        <span className="flex items-center gap-1">✅ Trusted by travelers worldwide</span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1">💳 No credit card required</span>
                        <span className="hidden md:inline">•</span>
                        <span className="flex items-center gap-1">💾 Save trips to dashboard</span>
                    </div>

                    <FacePile />
                </div>
            </div>
        </div>
    );
}

export default Hero;
