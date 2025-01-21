import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Register from "../pages/Auth/Register";
import Login from "../pages/Auth/Login";
import Layout from "../layouts/Layout";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import HomeUser from "../pages/user/HomeUser";
import UserLayout from "../layouts/UserLayout";
import Content from "../pages/admin/Content";
import Safety from "../pages/admin/Safety";
import UserManage from "../pages/admin/USerManage";
import Shopdetail from "../pages/Shopdetail";
import ShopLayout from "../layouts/ShopLayout";
import ShopDashboard from "../pages/shop/ShopDashboard";
import Profile from "../pages/shop/Profile";
import Reviews from "../pages/shop/Reviews";
import ProtectRouteUser from "./ProtectRouteUser";
import ProtectRouteShop from "./ProtectRouteShop";
import ProtectRouteAdmin from "./ProtectRouteAdmin";

const router = createBrowserRouter([
  // landing
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "shop/:id", element: <Shopdetail /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
    ],
  },
  // admin
  {
    path: "/admin",
    element: <ProtectRouteAdmin element={<AdminLayout />} />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "manage", element: <UserManage /> },
      { path: "content", element: <Content /> },
      { path: "safety", element: <Safety /> },
    ],
  },
  {
    path: "/shop",
    element: <ProtectRouteShop element={<ShopLayout />} />,
    children: [
      { index: true, element: <ShopDashboard /> },
      { path: "profile", element: <Profile /> },
      { path: "reviews", element: <Reviews /> },
    ],
  },
  {
    path: "/user",
    element: <ProtectRouteUser element={<UserLayout />} />,
    children: [{ index: true, element: <HomeUser /> }],
  },
]);

export default function Approutes() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
