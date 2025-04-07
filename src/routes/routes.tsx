import { Routes, Route } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import Home from '../pages/user/Home';
import FriendLayout from '../pages/user/FriendLayout/FriendLayout';
import GroupList from '../pages/user/FriendLayout/pages/GroupList';
import FriendList from '../pages/user/FriendLayout/pages/FriendList';
import FriendInvitation from '../pages/user/FriendLayout/pages/FriendInvitation';
import GroupInvitation from '../pages/user/FriendLayout/pages/GroupInvitation';
import Login from '../pages/user/FriendLayout/pages/Login';
import Register from '../components/Register';
import ForgotPassword from '../components/ForgotPassword';
import RegisterConfirm from '../components/RegisterConfirm';

const AppRoutes = () => {
    return(
        <Routes>
            {/* Layout chính (Navbar + Footer) */}
            <Route index element={<Login  />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="register/confirm" element={<RegisterConfirm />} />

            <Route path="/" element={<MainLayout />}>
                
                <Route path="danh-sach" element={<FriendLayout />} >
                    <Route path="trang-chu" element={<Home />} />
                    <Route path="danh-sach-ban-be" element={<FriendList />} />
                    <Route path="danh-sach-nhom" element={<GroupList />} />
                    <Route path="danh-sach-loi-moi-ket-ban" element={<FriendInvitation />} />
                    <Route path="danh-sach-loi-moi-vao-nhom" element={<GroupInvitation />} />
                </Route>
            </Route>

            {/* Layout cho trang quản trị */}
        </Routes>
    );
};

export default AppRoutes;