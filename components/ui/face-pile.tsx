import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FacePile() {
    const avatars = [
        { src: "https://i.pravatar.cc/100?img=1", label: "Sarah planned a trip to Italy 🇮🇹" },
        { src: "https://i.pravatar.cc/100?img=5", label: "Alex explored Bali 🏝️" },
        { src: "https://i.pravatar.cc/100?img=8", label: "John saved a Tokyo plan 🇯🇵" },
        { src: "https://i.pravatar.cc/100?img=12", label: "Emily visited Switzerland 🏔️" },
    ];

    return (
        <div className="flex items-center gap-3 mt-2 justify-center">
            <div className="flex -space-x-4">
                <TooltipProvider>
                    {avatars.map((user, i) => (
                        <Tooltip key={i}>
                            <TooltipTrigger>
                                <div className="relative group hover:z-10 transition-all hover:scale-110">
                                    <img
                                        src={user.src}
                                        className="h-10 w-10 rounded-full border-2 border-white dark:border-black shadow-md object-cover"
                                        alt="user"
                                    />
                                    <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] border_2 border-white shadow-sm">
                                        ✓
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{user.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Trusted by travelers</p>
        </div>
    );
}
