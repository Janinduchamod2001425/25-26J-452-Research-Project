"use client";

import { useState, useEffect, useRef } from "react";
import SplashScreen from "@/components/SplashScreen";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaTwitter, FaGithub, FaDiscord } from "react-icons/fa";

import bgImage from '../public/landingBG.jpg'
import Logo from '../assets/Logo.png'

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "AI-Powered Detection",
      description: "Advanced machine learning for precise fabric defect identification",
    },
    {
      title: "Real-time Analysis",
      description: "Instant scanning and detection of fabric imperfections",
    },
    {
      title: "Quality Control",
      description: "Ensure highest quality standards in textile production",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
      <div className="relative h-screen w-full overflow-hidden pb-20">
        {/* Background Image - Behind everything */}
        <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
        >
          <Image
              src={bgImage}
              alt="Background"
              fill
              className="object-cover hidden md:block"
              priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
        </motion.div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
          {/* Animated logo/text */}
          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8"
          >
            <h1 className="text-7xl md:text-[160px] font-bold text-white sm:mt-6 -mt-14">
              Fabric Vision
            </h1>
            <p className="sm:text-2xl text-gray/80 sm:mt-3">
              Intelligent Fabric Defect Detection
            </p>
          </motion.div>

          {/* Feature carousel */}
          <div className="max-w-md mx-auto mt-44 sm:mt-24 sm:mb-6 h-32">
            <AnimatePresence mode="wait">
              <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-white"
              >
                <h2 className="text-2xl font-semibold mb-2">
                  {features[activeFeature].title}
                </h2>
                <p className="text-lg text-white/80">
                  {features[activeFeature].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Animated button */}
          <motion.button
              onClick={() => setShowSplash(true)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white -mt-4 font-bold py-4 px-10 rounded-full text-lg transition-all shadow-lg shadow-indigo-500/30 relative overflow-hidden"
          >
            <span className="relative z-10">Start Detection</span>
            <motion.span
                className="absolute inset-0 bg-indigo-700 rounded-full z-0"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
            />
          </motion.button>
        </div>

        {/* Footer */}
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="fixed bottom-0 left-0 right-0 z-50 w-full py-6 px-4 bg-gradient-to-t from-black/80 to-transparent"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 px-4">
              {/* Logo and copyright - centered on mobile, left on desktop */}
              <div className="flex items-center gap-3 order-1 md:order-none">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                >
                  <Image
                      src={Logo}
                      alt="Background"
                      fill
                      className="object-cover hidden md:block"
                      priority
                  />
                </motion.div>
                <p className="text-white/60 text-sm">
                  © {new Date().getFullYear()} Fabric Vision. All rights reserved.
                </p>
              </div>

              {/* Links - centered on both */}
              <div className="flex flex-wrap justify-center gap-6 order-3 md:order-none md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
                <motion.a
                    whileHover={{ y: -2 }}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </motion.a>
                <motion.a
                    whileHover={{ y: -2 }}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </motion.a>
                <motion.a
                    whileHover={{ y: -2 }}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                >
                  Contact Us
                </motion.a>
              </div>

              {/* Social icons - centered on mobile, right on desktop */}
              <div className="flex gap-4 order-2 md:order-none">
                <motion.a
                    whileHover={{ y: -3, scale: 1.1 }}
                    target="_blank"
                    className="text-white/70 hover:text-blue-400 transition-colors"
                    aria-label="Twitter"
                >
                  <FaTwitter size={20} />
                </motion.a>
                <motion.a
                    whileHover={{ y: -3, scale: 1.1 }}
                    target="_blank"
                    className="text-white/70 hover:text-purple-400 transition-colors"
                    aria-label="GitHub"
                >
                  <FaGithub size={20} />
                </motion.a>
                <motion.a
                    whileHover={{ y: -3, scale: 1.1 }}
                    target="_blank"
                    className="text-white/70 hover:text-indigo-400 transition-colors"
                    aria-label="Discord"
                >
                  <FaDiscord size={20} />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <motion.div
              animate={{ x: [-100, 1000] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-4 left-0 h-0.5 w-32 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm"
          />
        </motion.footer>
      </div>
  );
}