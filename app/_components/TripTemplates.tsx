"use client";
import React from "react";
import { useRouter } from "next/navigation";

import { ArrowRight } from "lucide-react";


import Image from "next/image";
import { travelArtworkSrc } from "@/lib/travel-artwork";

const templates = [
    {
        title: "Beach Weekend",
        emoji: "🏖️",
        image: travelArtworkSrc("02-beach-weekend"),
        prompt: "Plan a relaxing beach weekend trip",
        bgClass: "bg-cyan-50/40 dark:bg-cyan-900/10",
        borderClass: "hover:border-cyan-200 dark:hover:border-cyan-800",
        shadowClass: "hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20"
    },
    {
        title: "Food Tour",
        emoji: "🍜",
        image: travelArtworkSrc("03-food-tour"),
        prompt: "Plan a food tour trip",
        bgClass: "bg-orange-50/40 dark:bg-orange-900/10",
        borderClass: "hover:border-orange-200 dark:hover:border-orange-800",
        shadowClass: "hover:shadow-orange-100 dark:hover:shadow-orange-900/20"
    },
    {
        title: "Mountain Escape",
        emoji: "🏔️",
        image: travelArtworkSrc("04-mountain-escape"),
        prompt: "Plan a mountain escape trip",
        bgClass: "bg-green-50/40 dark:bg-green-900/10",
        borderClass: "hover:border-green-200 dark:hover:border-green-800",
        shadowClass: "hover:shadow-green-100 dark:hover:shadow-green-900/20"
    },
];

export default function TripTemplates() {
    const router = useRouter();

    const handleSelect = (prompt: string) => {
        router.push(`/create-new-trip?query=${encodeURIComponent(prompt)}`);
    };

    return (
        <section className="py-10 bg-transparent">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-foreground">Start with a template</h2>
                    <p className="text-muted-foreground mt-2">Kickstart your planning with curated ideas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {templates.map((t) => (
                        <button
                            key={t.title}
                            onClick={() => handleSelect(t.prompt)}
                            className="group relative h-[400px] w-full rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 block"
                        >
                            {/* Full Background Image */}
                            <Image
                                src={t.image}
                                alt={t.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            {/* Glass Content at Bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-start text-left">
                                <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 p-4 rounded-2xl w-full">
                                    <h3 className="font-bold text-xl text-white mb-2 drop-shadow-md">
                                        {t.title}
                                    </h3>
                                    <p className="text-sm text-white/90 font-medium flex items-center gap-2">
                                        Tap to start <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
