import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileNav from "../components/MobileNav";
import AnimatedBackground from "../components/AnimatedBackground";
import ComposeModal from "../components/ComposeModal";
import CommandPalette from "../components/CommandPalette";
import ToastContainer from "../components/Toast";

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar />
        <main className="flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <MobileNav />
      <ComposeModal />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
}
