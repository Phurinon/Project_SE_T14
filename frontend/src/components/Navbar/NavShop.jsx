import { User } from "lucide-react";
import useDusthStore from "../../Global Store/DusthStore";
import { getCurrentUserProfile } from "../../api/users";
import { useEffect, useState } from "react";

export default function NavShop() {
  const { token, user } = useDusthStore();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (token) {
          const profile = await getCurrentUserProfile(token);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [token]);
  return (
    <div>
      <div className="h-[80px] px-6 bg-white shadow-lg border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 ml-auto">
          <button className="flex items-center gap-3 py-2 px-3 mr-5 rounded-full hover:bg-gray-100 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <User size={20} className="text-white" />
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700 text-left">
                {userProfile?.name || user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {userProfile?.email || user?.email || "email@example.com"}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
