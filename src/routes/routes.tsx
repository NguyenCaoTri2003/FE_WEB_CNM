import { Routes, Route } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import Home from '../pages/user/Home';
import FriendLayout from '../pages/user/FriendLayout/FriendLayout';
import GroupList from '../pages/user/FriendLayout/pages/GroupList';
import FriendList from '../pages/user/FriendLayout/pages/FriendList';
import FriendInvitation from '../pages/user/FriendLayout/pages/FriendInvitation';
import GroupInvitation from '../pages/user/FriendLayout/pages/GroupInvitation';

const AppRoutes = () => {
    return(
        <Routes>
            {/* Layout chính (Navbar + Footer) */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="danh-sach" element={<FriendLayout />} >
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