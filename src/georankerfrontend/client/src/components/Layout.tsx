import { ReactNode } from "react";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      <Navigation />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
