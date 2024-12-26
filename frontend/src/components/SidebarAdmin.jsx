import { Link } from "react-router-dom";

const menuItems = [
  { path: "/admin", label: "Dashboard", icon: "fas fa-tachometer-alt" },
  { path: "/admin/manage", label: "User Management", icon: "fas fa-users" },
  { path: "/admin/content", label: "Content Moderation", icon: "fas fa-edit" },
  { path: "/admin/safety", label: "Safety Levels", icon: "fas fa-shield-alt" },
  { path: "/admin/recommendation", label: "Recommendation", icon: "fas fa-thumbs-up" },
];

export default function SidebarAdmin() {
  return (
    <div>
      <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 p-4 z-50 transition-transform">
        <Link
          to="/"
          className="flex items-center pb-4 border-b border-gray-800"
        >
          <span className="text-lg font-bold text-white ml-3">Logo</span>
        </Link>

        <ul className="mt-4">
          {menuItems.map((item, index) => (
            <li key={index} className="mb-1">
              <Link
                to={item.path}
                className="flex items-center py-3 px-4 text-gray-300 hover:bg-gray-950 hover:text-gray-100 rounded-md"
              >
                <i className={`${item.icon} mr-3 text-lg`}></i>
                <span className="text-md">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
