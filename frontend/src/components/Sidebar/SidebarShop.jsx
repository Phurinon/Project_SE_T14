import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  MessageSquare, 
  LogOut, 
  Store,
} from "lucide-react";

const menuItems = [
  { path: "/shop", label: "Dashboard", icon: LayoutDashboard },
  { path: "/shop/profile", label: "Store Management", icon: Store },
  { path: "/shop/reviews", label: "Customer Reviews", icon: MessageSquare },
];

export default function SidebarShop() {
  const location = useLocation();

  return (
    <div className="relative">
      <div className="fixed left-0 top-0 w-64 h-full bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-4 z-50 transition-all duration-300 shadow-xl">
        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center gap-3 pb-6 border-b border-slate-700/30"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <Store className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Store Admin</span>
        </Link>

        {/* Menu Items */}
        <div className="mt-6">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center py-3 px-4 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? "animate-pulse" : ""}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            to="/"
            className="mt-2 flex items-center py-2.5 px-4 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">ออกจากระบบ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}