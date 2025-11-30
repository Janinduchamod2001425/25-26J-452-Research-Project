"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

import bgImage from "@/assets/SplashScreenBG1.png";

function LoadingMessages() {
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    "Initializing system...",
    "Loading detection modules...",
    "Starting AI engine...",
    "Preparing dashboard...",
    "Almost ready...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 1500); // Change message every 1.5 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="h-6 flex items-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-gray-600 font-bold whitespace-nowrap"
        >
          {messages[currentMessage]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function SplashScreen() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  const fabricLetters = ["F", "A", "B", "R", "I", "C"];
  const letterDelay = 0.3;
  const letterDuration = 0.6;
  const totalAnimationTime =
    fabricLetters.length * letterDelay + letterDuration;

  useEffect(() => {
    // Mark animation complete after all letters have appeared
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, totalAnimationTime * 1000);

    return () => clearTimeout(timer);
  }, [totalAnimationTime]);

  // Redirect to dashboard when animation completes
  useEffect(() => {
    if (animationComplete) {
      const redirectTimer = setTimeout(() => {
        router.push("/dashboard");
      }, 4500); // Wait 1 second after animation completes before redirecting

      return () => clearTimeout(redirectTimer);
    }
  }, [animationComplete, router]);

  if (!showSplash) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Splash Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content - Aligned to left side */}
      <div className="relative z-10 flex flex-col justify-center items-start min-h-screen transition-colors duration-300 pl-8 md:pl-16 lg:pl-24">
        <div className="flex flex-col items-start gap-8">
          {/* Spinner with loading text on the right */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <LoadingMessages />
          </div>

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
                  className={`text-6xl md:text-7xl font-bold ${
                    index === 0
                      ? "text-[#FFBE29]"
                      : index === 1
                        ? "text-[#FFBE29]"
                        : index === 2
                          ? "text-[#8D153A]"
                          : index === 3
                            ? "text-[#8D153A]"
                            : index === 4
                              ? "text-[#00534F]"
                              : "text-[#00534F]"
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
          className="mt-2 text-gray-600 font-semibold text-lg"
        >
          AI-Powered Fabric Defect Detection System
        </motion.p>
      </div>
    </div>
  );
}
