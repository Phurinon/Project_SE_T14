import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Register from '../pages/Auth/Register';
import Login from '../pages/Auth/Login';
import Layout from '../layouts/Layout';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import HomeUser from '../pages/user/HomeUser';
import UserLayout from '../layouts/UserLayout';
import Content from '../pages/admin/Content';
import Safety from '../pages/admin/Safety';
import Recommendation from '../pages/admin/Recommendation';
import UserManage from '../pages/admin/USerManage';

const router = createBrowserRouter([
    // landing
    {   
        path: '/', 
        element: <Layout />,
        children: [
            {index: true, element: <HomePage />},
            {path: 'register', element: < Register />},
            {path: 'login', element: < Login />},
        ]
    },
    // admin 
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {index: true, element: <Dashboard />},
            {path: 'manage', element: <UserManage />},
            {path: 'content', element: <Content />},
            {path: 'safety', element: <Safety />},
            {path: 'recommendation', element: <Recommendation />},
        ]
    },
    {
        path: '/user',
        element: <UserLayout />,
        children: [
            {index: true, element: <HomeUser />},
        ]
    }
])


export default function Approutes() {
  return (
    <>
        <RouterProvider router={router} />
    </>
  )
}
