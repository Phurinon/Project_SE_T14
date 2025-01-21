import { useState, useEffect } from "react";
import { Filter, Shield, ShieldOff, UserCog } from "lucide-react";
import { getAllUsers, changeUserStatus, changeUserRole } from "../../api/admin";
import useDusthStore from "../../Global Store/DusthStore";

export default function UserManage() {
  const token = useDusthStore((state) => state.token);
  const [users, setUsers] = useState([]);

  const handleGetUsers = async () => {
    try {
      const response = await getAllUsers(token);
      setUsers(response);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "pending" : "active";
      await changeUserStatus(userId, newStatus, token);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (err) {
      console.error("Failed to change status:", err);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    try {
      const newRole = currentRole === "user" ? "store" : "user";
      await changeUserRole(userId, newRole, token);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("Failed to change role:", err);
    }
  };

  useEffect(() => {
    if (token) {
      handleGetUsers();
    }
  }, [token]);

  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">รายชื่อผู้ใช้ทั้งหมด</h3>
            <div className="flex gap-2">
              <button className="p-2 border rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-center w-[3%]">ลำดับ</th>
                  <th className="px-4 py-3 text-center w-1/6">ชื่อ</th>
                  <th className="px-4 py-3 text-center w-1/6">อีเมล</th>
                  <th className="px-4 py-3 text-center w-1/6">ประเภท</th>
                  <th className="px-4 py-3 text-center w-1/6">สถานะ</th>
                  <th className="px-4 py-3 text-center w-1/6">วันที่สมัคร</th>
                  <th className="px-4 py-3 text-center w-1/6">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user, index) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-4 py-3 w-1/6 text-center">{index + 1}</td>
                    <td className="px-4 py-3 w-1/6 text-center">{user.name}</td>
                    <td className="px-4 py-3 w-1/6 text-center">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 w-1/6 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "store"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role === "store"
                          ? "ร้านค้า"
                          : user.role === "admin"
                          ? "ผู้ดูแล"
                          : "ผู้ใช้ทั่วไป"}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-1/6 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.status === "active" ? "ใช้งาน" : "รอตรวจสอบ"}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-1/6 text-center">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("th-TH")
                        : "ไม่ระบุ"}
                    </td>
                    <td className="px-4 py-3 w-1/6">
                      <div className="flex justify-center gap-2">
                        {user.role !== "admin" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(user.id, user.status)
                              }
                              className={`p-1 rounded hover:bg-opacity-20 ${
                                user.status === "active"
                                  ? "text-green-600 hover:bg-red-100"
                                  : "text-red-600 hover:bg-green-100"
                              }`}
                              title={
                                user.status === "active"
                                  ? "Pending User"
                                  : "Activate User"
                              }
                            >
                              {user.status === "active" ? (
                                <Shield className="h-5 w-5" />
                              ) : (
                                <ShieldOff className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleRoleChange(user.id, user.role)
                              }
                              className="p-1 rounded text-blue-600 hover:bg-blue-100"
                              title="Change Role"
                            >
                              <UserCog className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
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
