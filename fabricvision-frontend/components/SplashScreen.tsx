"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SplashScreen() {
    const [animationComplete, setAnimationComplete] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    const letters = ["F", "A", "B", "R", "I", "C"];
    const letterDelay = 0.5; // seconds between each letter
    const letterDuration = 0.8; // seconds for each letter animation
    const totalAnimationTime = letters.length * letterDelay + letterDuration;

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
            <div className="flex items-center gap-8">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>

                {/* Animated F A B R I C letters */}
                <div className="flex gap-4">
                    {letters.map((letter, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onAnimationComplete={() => {
                                // When last letter finishes animating
                                if (index === letters.length - 1) {
                                    setAnimationComplete(true);
                                }
                            }}
                            transition={{
                                delay: index * letterDelay,
                                duration: letterDuration,
                                type: "spring",
                                stiffness: 100,
                                damping: 10,
                            }}
                            className={`relative sm:text-7xl text-5xl font-extrabold ${
                                letter === "F"
                                    ? "bg-clip-text text-transparent bg-[linear-gradient(90deg,#FFBE29_0%,#FFBE29_33%,#8D153A_33%,#8D153A_66%,#00534F_66%,#00534F_100%)]"
                                    : "text-black"
                            }`}
                        >
                            {letter === "F" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        delay: index * letterDelay + 0.3,
                                        duration: 0.5,
                                    }}
                                    className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                                >
                                    {/* Fabric Icon */}
                                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 via-red-700 to-green-700 rounded-lg flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white rounded-sm"></div>
                                    </div>
                                </motion.div>
                            )}
                            {letter}
                        </motion.div>
                    ))}
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
                className="mt-6 text-gray-600 font-semibold"
            >
                AI-Powered Fabric Defect Detection System
            </motion.p>
        </div>
    );
}