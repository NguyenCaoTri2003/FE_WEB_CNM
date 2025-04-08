import '../../../assets/styles/SettingLayout.css';
import { Outlet } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { Link } from 'react-router-dom';
const SettingLayout = () => {
    return (
        <div className="setting-layout">
            <div className="left-section">
                <div className="menu-setting">
                    <Link to="thong-tin-ca-nhan">
                        <div className="menu-setting-item">
                            <p className="menu-item-name">Thông tin cá nhân</p>
                            <RightOutlined className="icon-right" />
                        </div>
                    </Link>
                    
                    <div className="menu-setting-item">
                        <p className="menu-item-name">Bảo mật và đăng nhập</p>
                        <RightOutlined className="icon-right" />
                    </div>
                    <div className="menu-setting-item">
                        <p className="menu-item-name">Cài đặt chung</p>
                        <RightOutlined className="icon-right" />
                    </div>
                    <div className="menu-setting-item">
                        <p className="menu-item-name">Cài đặt ứng dụng</p>
                        <RightOutlined className="icon-right" />
                    </div>
                    <div className="menu-setting-item">
                        <p className="menu-item-name">Trợ giúp và hỗ trợ</p>
                        <RightOutlined className="icon-right" />
                    </div>
                </div>
            </div>
            <div className="right-section">
                <Outlet/>
            </div>
        </div>
    );
};
export default SettingLayout;