"use client";
import { motion } from "framer-motion";
import { Map, Plane, Hotel } from "lucide-react";

export default function FloatingIcons() {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none hidden md:block overflow-hidden">
            <motion.div
                className="absolute left-[10%] top-[20%] bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-4 border border-border opacity-70 hover:opacity-100 transition duration-300"
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <Plane className="text-orange-500 w-8 h-8" />
            </motion.div>

            <motion.div
                className="absolute right-[15%] top-[25%] bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-4 border border-border opacity-70 hover:opacity-100 transition duration-300"
                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                <Map className="text-purple-500 w-8 h-8" />
            </motion.div>

            <motion.div
                className="absolute left-[15%] bottom-[25%] bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-4 border border-border opacity-70 hover:opacity-100 transition duration-300"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                <Hotel className="text-pink-500 w-8 h-8" />
            </motion.div>
        </div>
    );
}
