import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import useDusthStore from "../../Global Store/DusthStore";

const menuItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/manage", label: "Manage", icon: Users },
  { path: "/admin/content", label: "Content Moderation", icon: MessageSquare },
  { path: "/admin/safety", label: "Safety Levels", icon: ShieldAlert },
];

export default function SidebarAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useDusthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="relative">
      <div className="fixed left-0 top-0 w-64 h-full bg-gradient-to-b from-slate-800 via-slate-900 to-zinc-950 p-4 z-50 transition-all duration-300 shadow-xl">
        <Link
          to="/user"
          className="flex items-center gap-3 pb-6 border-b border-slate-700/30"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <span className="text-white text-xl font-bold">A</span>
          </div>
          <span className="text-lg font-bold text-white">AdminPanel</span>
        </Link>

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
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-purple-100 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? "animate-pulse" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-3 px-4 text-purple-100 hover:bg-pink-500/20 hover:text-pink-300 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
}