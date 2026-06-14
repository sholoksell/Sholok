import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <Sidebar />
    <main className="lg:pl-60 pt-0">
      <div className="animate-fade-in">{children}</div>
    </main>
  </div>
);
