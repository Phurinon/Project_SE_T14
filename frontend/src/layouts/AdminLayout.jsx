import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div>
        <h1>Sidebar</h1>
        <h1>Headerbar</h1>
        <hr />
        < Outlet />
    </div>
  )
}
