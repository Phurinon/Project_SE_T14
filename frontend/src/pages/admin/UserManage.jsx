import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Users, 
  UserCheck,
  UserX,
  UserCog
} from 'lucide-react';
import { getAllUsers, changeUserStatus, changeUserRole } from "../../api/admin";
import useDusthStore from "../../Global Store/DusthStore";

const UserBadge = ({ type, children }) => {
  const badgeStyles = {
    store: "bg-purple-100 text-purple-700",
    admin: "bg-red-100 text-red-700",
    user: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs inline-flex items-center gap-2 ${badgeStyles[type]}`}>
      {children}
    </span>
  );
};

export default function UserManage() {
  const token = useDusthStore((state) => state.token);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers(token);
      setUsers(response);
    } catch (err) {
      console.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้:", err);
    }
  };


  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm.trim() || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-500" />
            User Management
          </h1>
        </header>

        <div className="bg-white rounded-2xl shadow-lg">
          <div className="p-6 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-700">
                รายชื่อผู้ใช้
              </h3>
              <div className="flex items-center gap-2">
                <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="all">ทุกบทบาท</option>
                  <option value="user">ผู้ใช้ทั่วไป</option>
                  <option value="store">ร้านค้า</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
              </div>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาผู้ใช้..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr className="text-center">
                  <th className="px-4 py-3 text-left">ชื่อ</th>
                  <th className="px-4 py-3 text-left">อีเมล</th>
                  <th className="px-4 py-3 text-left">บทบาท</th>
                  <th className="px-4 py-3 text-left">วันที่สมัคร</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <UserBadge type={user.role}>
                        {user.role === "store" ? "ร้านค้า" : 
                         user.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}
                      </UserBadge>
                    </td>
                    <td className="px-4 py-3">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('th-TH') 
                        : "ไม่ระบุ"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}