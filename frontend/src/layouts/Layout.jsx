import { Outlet } from "react-router-dom";
import MainNav from "../components/Navbar/MainNav";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="relative h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
}
