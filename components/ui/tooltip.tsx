"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

const Tooltip = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false)
    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<{ open?: boolean }>, { open })
                }
                return child
            })}
        </div>
    )
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactElement;
    open?: boolean;
}

const TooltipTrigger = ({ children, ...props }: TooltipTriggerProps) => {
    return React.cloneElement(children, { ...props });
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children: React.ReactNode;
    open?: boolean;
}

const TooltipContent = ({ className, children, open, ...props }: TooltipContentProps) => {
    if (!open) return null
    return (
        <div
            className={cn(
                "absolute z-50 overflow-hidden rounded-md border bg-black px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
