import { Outlet } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_36%),radial-gradient(circle_at_right,_rgba(59,130,246,0.14),_transparent_24%)]" />
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
