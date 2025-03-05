import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, MessageSquare, LogOut, Store } from "lucide-react";
import useDusthStore from "../../Global Store/DusthStore";

const menuItems = [
  { path: "/shop", label: "Dashboard", icon: LayoutDashboard },
  { path: "/shop/profile", label: "Management", icon: Store },
  { path: "/shop/reviews", label: "Customer Reviews", icon: MessageSquare },
];

export default function SidebarShop() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useDusthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="relative">
      <div className="fixed left-0 top-0 w-64 h-full bg-[#212329] p-4 z-50 transition-all duration-300 shadow-xl">
        {/* Logo Section */}
        <Link
          to="/user"
          className="flex items-center gap-3 pb-6 border-b border-slate-700/30"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <Store className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Store</span>
        </Link>

        {/* Menu Items */}
        <ul className="mt-6 space-y-2">
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
                  <item.icon
                    className={`w-5 h-5 mr-3 ${
                      isActive ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-3 px-4 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
}