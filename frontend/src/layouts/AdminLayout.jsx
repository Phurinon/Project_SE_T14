import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/SidebarAdmin";
import NavAdmin from "../components/NavAdmin";

export default function AdminLayout() {
  return (
    <div>
      <SidebarAdmin />
      <NavAdmin />
      <main className="w-full md:w-[calc(100%-256px)] mt-5 md:ml-64 bg-gray-50 min-h-screen transition-all">
        <Outlet />
      </main>
    </div>
  );
}
