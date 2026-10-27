import React, { useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface GlassModalProps {
    /**
     * Controls the open/closed state of the modal
     */
    isOpen: boolean;

    /**
     * Callback fired when the modal requests to close
     * (via ESC key, backdrop click, or close button)
     */
    onClose: () => void;

    /**
     * Optional title displayed in the header
     */
    title?: React.ReactNode;
    /** Screen-reader title when the visual heading is part of the content. */
    accessibleTitle?: string;

    /**
     * Optional description text for accessibility and context
     */
    description?: string;

    /**
     * The content to display inside the modal
     */
    children: React.ReactNode;

    /**
     * Optional class name to override styles
     */
    className?: string;
}

/**
 * GlassModal
 * A reusable theme-aware modal surface.
 * 
 * Features:
 * - Centered layout
 * - Rounded 2xl corners
 * - Shared theme colors
 * - Opaque, readable surface
 * - Scroll locking (handled by Radix UI/Shadcn)
 * - Accessibility (ARIA)
 */
export function GlassModal({
    isOpen,
    onClose,
    title,
    accessibleTitle = "Details",
    description,
    children,
    className,
}: GlassModalProps) {
    const returnFocus = useRef<HTMLElement | null>(null);
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                onOpenAutoFocus={() => {
                    returnFocus.current = document.activeElement instanceof HTMLElement
                        ? document.activeElement : null;
                }}
                onCloseAutoFocus={(event) => {
                    if (returnFocus.current?.isConnected) {
                        event.preventDefault();
                        returnFocus.current.focus({ preventScroll: true });
                    }
                }}
                className={cn(
                    // Layout & Shape
                    "sm:max-w-lg w-[95%] rounded-2xl p-0 overflow-hidden",

                    // Glassmorphism Visuals
                    "bg-card text-card-foreground", // Semi-transparent background
                    "", // Content blur
                    "border-border", // Subtle border
                    "shadow-xl", // Soft shadow

                    // Animation (Derived from shadcn default, enhanced here if needed)
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                    "duration-200",

                    className
                )}
            >
                {(title || description) ? (
                    <DialogHeader className="px-6 pt-6 pb-2">
                        {title && <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>}
                        {description && (
                            <DialogDescription className="text-muted-foreground">
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                ) : (
                    <>
                        <DialogTitle className="sr-only">{accessibleTitle}</DialogTitle>
                        <DialogDescription className="sr-only">View details and available actions.</DialogDescription>
                    </>
                )}

                <div className={cn("relative", (title || description) ? "px-6 pb-6" : "")}>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
