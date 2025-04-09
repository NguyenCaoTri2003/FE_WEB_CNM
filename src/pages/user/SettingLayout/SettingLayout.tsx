import '../../../assets/styles/SettingLayout.css';
import { Outlet } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { Link } from 'react-router-dom';
const SettingLayout = () => {
    return (
        <div className="setting-layout">
            <div className="left-section">
                <div className="menu-setting">
                    {/* <Link to="forgot-password">
                        <div className="menu-setting-item">
                            <p className="menu-item-name">Quên mật khẩu</p>
                            <RightOutlined className="icon-right" />
                        </div>
                    </Link> */}
                    <Link to="update-password">
                        <div className="menu-setting-item">
                            <p className="menu-item-name">Cập nhật mật khẩu</p>
                            <RightOutlined className="icon-right" />
                        </div>
                    </Link>
                </div>
            </div>
            <div className="right-section">
                <Outlet/>
            </div>
        </div>
    );
};
export default SettingLayout;