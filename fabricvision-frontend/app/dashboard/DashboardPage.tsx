"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal, { SweetAlertOptions } from "sweetalert2";

import {
  Activity,
  Camera,
  Home,
  Menu,
  Scan,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Inter } from "next/font/google";

// Dashboard Pages
import HomePage from "@/dashboard_pages/HomePage";
import FrameCaptureModule from "@/dashboard_pages/FrameCaptureModule";
import FogComputingModule from "@/dashboard_pages/FogComputingModule";
import DefectDetectionModule from "@/dashboard_pages/DefectDetectionModule";
import PredictiveAnalyticsModule from "@/dashboard_pages/PredictiveAnalyticsModule";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
});

const sidebarItemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

interface MongoUserProfile {
  _id: string;
  uid: string;
  firstname: string;
  lastname: string;
  address: string;
  nic: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  profilePicture?: string;
}

interface MongoUserResponse {
  success: boolean;
  profile: MongoUserProfile;
}

const DashboardPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [mongoUserName, setMongoUserName] = useState<string>("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mongoUser, setMongoUser] = useState<MongoUserResponse | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Reset scroll position when activeTab changes
  useEffect(() => {
    const resetScrollPosition = () => {
      // Reset main content area scroll
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      // Reset window scroll as backup
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Use setTimeout to ensure the DOM has updated
    const timer = setTimeout(resetScrollPosition, 0);

    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#000",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "No, Stay In",
      customClass: {
        popup: "!rounded-3xl font-inter",
        title: "!font-inter",
        container: "!font-inter",
        confirmButton:
          "!rounded-full !px-5 !py-2 !text-sm font-inter !font-semibold",
        cancelButton:
          "!rounded-full !px-5 !py-2 !text-sm font-inter !font-semibold",
      },
      scrollbarPadding: false,
    } as SweetAlertOptions);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsProfileOpen(false);
      }

      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(target)
      ) {
        setMobileProfileOpen(false);
      }

      if (mobileMenuOpen) {
        const isClickOnMenu = mobileMenuRef.current?.contains(target);
        const isClickOnMenuButton =
          mobileMenuButtonRef.current?.contains(target);

        if (!isClickOnMenu && !isClickOnMenuButton) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen, mobileProfileOpen, isProfileOpen]);

  // Initialize activeTab from URL search params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`?tab=${tab}`);
  };

  const navItems = [
    { icon: Home, label: "Home", tab: "home" },
    { icon: Camera, label: "Frame Capture", tab: "frame_capture_module" },
    { icon: Activity, label: "Fog Computing", tab: "fog_computing_module" },
    { icon: Scan, label: "Defect Detection", tab: "defect_detection_module" },
    {
      icon: TrendingUp,
      label: "Predictive Analytics",
      tab: "predictive_analytics_module",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "frame_capture_module":
        return <FrameCaptureModule />;
      case "fog_computing_module":
        return <FogComputingModule />;
      case "defect_detection_module":
        return <DefectDetectionModule />;
      case "predictive_analytics_module":
        return <PredictiveAnalyticsModule />;

      default:
        return <HomePage />;
    }
  };

  const renderProfileMenu = (isMobile = false) => {
    const profileMenuItems = [
      { icon: Activity, label: "My Activity", tab: "my_activity" },
      { icon: User, label: "Operator Profile", tab: "profile" },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`absolute sm:right-0 -right-12 top-full mt-2 w-64 bg-gray-50 rounded-3xl shadow-lg border border-gray-100 py-2 z-50 ${
          isMobile ? "md:hidden" : "hidden md:block"
        }`}
      >
        {/* Profile Info Section */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {mongoUser?.profile?.firstname
                  ? `${mongoUser.profile.firstname} ${mongoUser.profile.lastname}`
                  : mongoUserName || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {"user@example.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="py-1">
          {profileMenuItems.slice(0, 4).map(({ icon: Icon, label, tab }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  handleTabChange(tab);
                  isMobile
                    ? setMobileProfileOpen(false)
                    : setIsProfileOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 mr-3 ${isActive ? "text-indigo-600" : ""}`}
                />
                {label}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Settings and Logout */}
        <div className="pt-1 border-t border-gray-100">
          {profileMenuItems.slice(4).map(({ icon: Icon, label, tab }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  handleTabChange(tab);
                  isMobile
                    ? setMobileProfileOpen(false)
                    : setIsProfileOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 mr-3 ${isActive ? "text-indigo-600" : ""}`}
                />
                {label}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center rounded-2xl transition-all duration-200"
          >
            <svg
              className="w-4 h-4 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Log out
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`py-4 px-6 shadow-sm backdrop-blur-sm bg-white/70 border-b border-gray-100 relative z-[100] ${inter.className}`}
      >
        <div className="flex items-center justify-between sm:ml-4">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.h1
              className="text-2xl font-bold tracking-tight bg-black bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              F A B R I C Vision
            </motion.h1>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-2">
            {navItems.map(({ icon: Icon, label, tab }, i) => {
              const isActive = activeTab === tab;
              return (
                <motion.div
                  key={label}
                  custom={i}
                  variants={sidebarItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative group"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <button
                    onClick={() => handleTabChange(tab)}
                    className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-blue-100 text-indigo-700 shadow-inner"
                        : "text-gray-600 hover:bg-blue-50 hover:text-gray-800"
                    }`}
                  >
                    <motion.div
                      animate={
                        isActive
                          ? { scale: 1.1, rotate: 5 }
                          : { scale: 1, rotate: 0 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                      }}
                    >
                      <Icon
                        className={`text-lg ${isActive ? "font-bold text-indigo-800" : ""}`}
                      />
                    </motion.div>
                    <span
                      className={`ml-3 ${inter.className} ${
                        isActive ? "font-bold" : "font-medium"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3 sm:mr-4">
            {/* Profile icon with Dropdown - Desktop */}
            <div
              className="hidden md:flex items-center relative"
              ref={dropdownRef}
            >
              <button
                className="flex items-center space-x-3 rounded-full hover:bg-gray-100 transition-colors px-3 py-2 max-w-[280px]"
                onClick={() => setIsProfileOpen((prev) => !prev)}
              >
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-100 shadow-sm flex-shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="hidden lg:block text-left min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                    {mongoUser?.profile?.firstname
                      ? `${mongoUser.profile.firstname} ${mongoUser.profile.lastname}`
                      : mongoUserName || "User"}
                  </p>
                  <p className="text-xs font-medium text-gray-600 truncate">
                    {"user@example.com"}
                  </p>
                </div>
                {/* Chevron icon */}
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isProfileOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <AnimatePresence>
                {isProfileOpen && renderProfileMenu()}
              </AnimatePresence>
            </div>

            {/* Mobile profile icon with dropdown */}
            <div
              className="md:hidden flex items-center relative"
              ref={mobileDropdownRef}
            >
              <button
                title="Profile"
                className="rounded-full bg-white hover:bg-gray-100 transition-colors shadow-sm flex-shrink-0"
                onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
              >
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-100 shadow-sm">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
              </button>

              <AnimatePresence>
                {mobileProfileOpen && renderProfileMenu(true)}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <motion.button
              ref={mobileMenuButtonRef}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              title="Menu"
              className={`xl:hidden p-2 rounded-full transition-colors border border-indigo-100 duration-200 ${
                mobileMenuOpen
                  ? "bg-indigo-100 text-indigo-600 shadow-inner"
                  : "bg-gray-50 hover:bg-gray-100 shadow-sm"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden overflow-hidden mt-4 bg-white rounded-xl shadow-lg p-1"
            >
              <div className="py-2 space-y-1">
                {navItems.map(({ icon: Icon, label, tab }) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={label}
                      onClick={() => {
                        handleTabChange(tab);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-4 py-3 rounded-lg ${
                        isActive
                          ? "bg-blue-50 outline text-indigo-700 rounded-xl"
                          : "text-gray-600 hover:bg-gray-300 rounded-xl"
                      }`}
                    >
                      <motion.div
                        animate={
                          isActive
                            ? { scale: 1.1, rotate: 5 }
                            : { scale: 1, rotate: 0 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        }}
                      >
                        <Icon
                          className={`text-lg ${isActive ? "font-bold" : ""}`}
                        />
                      </motion.div>
                      <span
                        className={`ml-3 ${inter.className} ${
                          isActive ? "font-bold" : "font-medium"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content - Updated with ref */}
      <main
        ref={mainContentRef}
        className="flex-1 overflow-y-auto p-4 pt-2 md:p-6 md:pt-2"
      >
        <div>{renderContent()}</div>
      </main>
    </div>
  );
};

export default DashboardPage;
