import { Outlet } from 'react-router-dom';
import '../assets/styles/MainLayout.css';
import Navbar from '../components/Navbar';
import SearchNavbar from '../components/SearchNavbar';

const MainLayout = () => {
    return(
        <div className="App bg-white ">
            <Navbar/>
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;