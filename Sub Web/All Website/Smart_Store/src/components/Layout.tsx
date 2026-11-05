import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import TopBar from "@/components/marketplace/TopBar";
import Header from "@/components/marketplace/Header";
import NavBar from "@/components/marketplace/NavBar";
import Footer from "@/components/marketplace/Footer";
import CartDrawer from "@/components/marketplace/CartDrawer";
import QuickView from "@/components/marketplace/QuickView";

export default function Layout({ children, hideFooter = false }: { children: ReactNode; hideFooter?: boolean }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <Header />
      <NavBar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1"
      >
        {children}
      </motion.main>
      {!hideFooter && <Footer />}
      <CartDrawer />
      <QuickView />
    </div>
  );
}
