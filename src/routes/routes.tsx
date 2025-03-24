import { Routes, Route } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import Home from '../pages/user/Home';

const AppRoutes = () => {
    return(
        <Routes>
            {/* Layout chính (Navbar + Footer) */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
            </Route>

            {/* Layout cho trang quản trị */}
        </Routes>
    );
};

export default AppRoutes;