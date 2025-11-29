"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SplashScreen() {
    const [animationComplete, setAnimationComplete] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    const fabricLetters = ["F", "A", "B", "R", "I", "C"];
    const letterDelay = 0.3; // seconds between each letter
    const letterDuration = 0.6; // seconds for each letter animation
    const totalAnimationTime = fabricLetters.length * letterDelay + letterDuration;

    useEffect(() => {
        // Mark animation complete after all letters have appeared
        const timer = setTimeout(() => {
            setAnimationComplete(true);
        }, totalAnimationTime * 1000);

        return () => clearTimeout(timer);
    }, [totalAnimationTime]);

    if (!showSplash) return null;

    return (
        <div className="bg-white flex flex-col justify-center items-center min-h-screen transition-colors duration-300">
            <div className="flex flex-col items-center gap-8">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>

                {/* Fabric Vision in same line */}
                <div className="flex items-baseline gap-2">
                    {/* Animated F A B R I C letters */}
                    <div className="flex">
                        {fabricLetters.map((letter, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * letterDelay,
                                    duration: letterDuration,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 10,
                                }}
                                className="text-6xl md:text-7xl font-extrabold text-black"
                            >
                                {letter}
                            </motion.div>
                        ))}
                    </div>

                    {/* Vision text with Sri Lankan flag colors - no animation */}
                    <div className="flex">
                        {"VISION".split("").map((letter, index) => (
                            <span
                                key={index}
                                className={`text-6xl md:text-7xl font-extrabold ${
                                    index === 0 ? "text-[#FFBE29]" :
                                        index === 1 ? "text-[#FFBE29]" :
                                            index === 2 ? "text-[#8D153A]" :
                                                index === 3 ? "text-[#8D153A]" :
                                                    index === 4 ? "text-[#00534F]" :
                                                        "text-[#00534F]"
                                }`}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading text that appears after letters */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    delay: totalAnimationTime - 1,
                    duration: 1,
                }}
                className="mt-6 text-gray-600 font-semibold text-lg"
            >
                AI-Powered Fabric Defect Detection System
            </motion.p>
        </div>
    );
}