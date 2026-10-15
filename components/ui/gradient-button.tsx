import React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "gradient" | "outline" | "ghost";
};

export default function GradientButton({
    className,
    variant = "gradient",
    ...props
}: Props) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                variant === "gradient" &&
                "tc-button",
                variant === "outline" &&
                "border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900",
                variant === "ghost" &&
                "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800",
                className
            )}
            {...props}
        />
    );
}
