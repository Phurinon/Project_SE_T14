import { Outlet } from "react-router-dom";
import NavShop from "../components/Navbar/NavShop";
import SidebarShop from "../components/Sidebar/SidebarShop";
export default function ShopLayout() {
  return (
    <div>
      <SidebarShop />
      <NavShop />
      <main className="w-full md:w-[calc(100%-256px)] mt-5 md:ml-64 bg-gray-50 min-h-screen transition-all">
        <Outlet />
      </main>
    </div>
  );
}
