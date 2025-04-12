import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../assets/styles/Navbar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faContactBook, faTools, faCloud } from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from '../config/api';
import { UserOutlined, SettingOutlined, GlobalOutlined, QuestionCircleOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";


// Định nghĩa interface cho dữ liệu user
interface UserProfile {
  fullName: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
}


const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [showSettings, setShowSettings] = useState(false);



//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) return;

//         const res = await axios.get(API_PROFILE, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         // Nếu res.data là unknown, ép kiểu trước:
//         const data = res.data as {
//           success: boolean;
//           message: string;
//           user: UserProfile;
//         };

//         if (data.success) {
//           setUser(data.user);
//         } else {
//           console.error("Lỗi khi lấy thông tin user:", data.message);
//         }
//       } catch (err) {
//         console.error("Lỗi khi gọi API:", err);
//       }
//     };

//     fetchUserProfile();
//   }, []);
    useEffect(() => {
        const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
    
            const res = await axios.get(API_ENDPOINTS.profile, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
    
            const data = res.data as {
            success: boolean;
            message: string;
            user: UserProfile;
            };
    
            if (data.success) {
            setUser(data.user);
            } else {
            console.error("Lỗi khi lấy thông tin user:", data.message);
            }
        } catch (err) {
            console.error("Lỗi khi gọi API:", err);
        }
        };
    
        fetchUserProfile(); // Gọi khi khởi động
    
        // 👇 Gọi lại khi có sự kiện cập nhật avatar
        const handleAvatarUpdate = () => {
        fetchUserProfile();
        };
    
        window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
        return () => {
        window.removeEventListener('avatarUpdated', handleAvatarUpdate);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          const dropdown = document.querySelector('.settings-dropdown');
          const settingsBtn = document.querySelector('.settings-trigger');
      
          if (
            dropdown &&
            settingsBtn &&
            !dropdown.contains(event.target as Node) &&
            !settingsBtn.contains(event.target as Node)
          ) {
            setShowSettings(false);
          }
        };
      
        document.addEventListener('click', handleClickOutside);
        return () => {
          document.removeEventListener('click', handleClickOutside);
        };
      }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

  return (
    <div className="container-main">
      <div className="header">
        <Link to="/profile">
          <div className="user-avatar">
            <img
              className='img-user'
              src={
                user?.avatar ||
                "https://res.cloudinary.com/ds4v3awds/image/upload/v1743944990/l2eq6atjnmzpppjqkk1j.jpg"
              }
              alt="avatar"
            />
          </div>
        </Link>

        <div className="icons-info">
          <Link to="/user/home">
            <div className="icon-chat">
              <FontAwesomeIcon icon={faComments} />
            </div>
          </Link>
          <Link to="/danh-sach">
            <div className="icon-contact">
              <FontAwesomeIcon icon={faContactBook} />
            </div>
          </Link>
        </div>
      </div>

      <div className="footer">
        <div className="icon-cloud">
          <FontAwesomeIcon icon={faCloud} />
        </div>
        
          <div
            className={`icon-setting settings-trigger ${showSettings ? 'active' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
            }}
          >
            <FontAwesomeIcon icon={faTools} />
          </div>
        
      </div>

      {showSettings && (
                <div className="settings-dropdown">
                    <div className="menu-item" onClick={() => {navigate('/profile'); setShowSettings(!showSettings)} } >
                        <UserOutlined />
                        Thông tin tài khoản
                    </div>
                    <div className="menu-item" onClick={() => {navigate('/setting'); setShowSettings(!showSettings)} } >
                        <SettingOutlined />
                        Cài đặt
                    </div>
                    <div className="menu-item">
                        <GlobalOutlined />
                        Ngôn ngữ
                    </div>
                    <div className="menu-item">
                        <QuestionCircleOutlined />
                        Hỗ trợ
                    </div>
                    <div className="divider"></div>
                    <div className="menu-item danger" onClick={handleLogout}>
                        <UserSwitchOutlined />
                        Đăng xuất
                    </div>
                    <div className="menu-item">
                        Thoát
                    </div>
                </div>
            )} 
    </div>
  );
};

export default Navbar;
