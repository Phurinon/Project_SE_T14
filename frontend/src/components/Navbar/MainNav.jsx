import { Link, NavLink } from "react-router-dom";
import useDusthStore from "../../Global Store/DusthStore";
import { ChevronDown } from "lucide-react";
import { useState} from "react";

export default function MainNav() {
  const logout = useDusthStore((state) => state.logout);
  const user = useDusthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-xl border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16">
          {/* Logo and Primary Nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              LOGO
            </Link>
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100"
            >
              Home
            </Link>
          </div>

          {/* Profile  */}
          {user ? (
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 hover:bg-gray-200
              px-2 py-2 rounded-md"
              >
                <img
                  className="w-8 h-8"
                  src="https://cdn-icons-png.flaticon.com/128/3177/3177440.png"
                />
                <ChevronDown />
              </button>

              {isOpen && (
                <div className="absolute top-16 bg-white shadow-md z-50">
                  <button
                    onClick={() => logout()}
                    className="block px-4 py-2 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                    : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium "
                }
                to={"/register"}
              >
                Register
              </NavLink>

              <NavLink
                className={({ isActive }) =>
                  isActive
                    ? "bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                    : "hover:bg-slate-200 px-3 py-2 rounded-md text-sm font-medium "
                }
                to={"/login"}
              >
                Login
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
