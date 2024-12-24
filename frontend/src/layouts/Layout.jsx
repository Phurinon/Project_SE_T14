import { Outlet } from "react-router-dom";
import MainNav from "../components/MainNav";

export default function Layout() {
  return (
    <div>
      <MainNav />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
