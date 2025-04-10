import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '../../assets/styles/Home.css';
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faLaughBeam, faImage, faFileCirclePlus, faAddressCard, faUserGroup, faUser } from "@fortawesome/free-solid-svg-icons";
import { Form, Input, Button, message, Card, Typography, Alert } from 'antd';
import Modal from "react-modal";
import { UsergroupAddOutlined, UserAddOutlined, EllipsisOutlined, MoreOutlined, VideoCameraOutlined, MenuFoldOutlined, MehOutlined, LikeFilled, BellOutlined, PushpinOutlined, EditOutlined, CaretRightFilled, CaretDownFilled, UserOutlined, MessageOutlined, TeamOutlined, PhoneOutlined, CloudOutlined, ContactsOutlined, CheckSquareOutlined, CloudDownloadOutlined, BorderOuterOutlined, SettingOutlined, BarsOutlined, GlobalOutlined, QuestionCircleOutlined, UserSwitchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

interface Message {
    id: number;
    name: string;
    message: string;
    time: string;
}

const messages: Message[]  = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        message: "Bạn có rảnh không. jhfgduiofjhbskjdlfdjdnskjlfjdkslfjndklfmn",
        time: "14:30"
    },
    {
        id: 2,
        name: "Trần Thị B",
        message: "Tối nay đi chơi nhé!",
        time: "13:15"
    },
    {
        id: 3,
        name: "Nhóm bạn bè",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    },
    {
        id: 4,
        name: "Nhóm bạn bè 4",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    },
    {
        id: 5,
        name: "Nhóm bạn bè 5",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    },
    {
        id: 6,
        name: "Nhóm bạn bè 6",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    },
    {
        id: 7,
        name: "Nhóm bạn bè 7",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    },
    {
        id: 8,
        name: "Nhóm bạn bè 8",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    },
    {
        id: 9,
        name: "Nhóm bạn bè 9",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    },
    {
        id: 10,
        name: "Nhóm bạn bè 10",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    },
    {
        id: 11,
        name: "Nhóm bạn bè 11",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    },
    {
        id: 12,
        name: "Nhóm bạn bè 12",
        message: "Họp nhóm lúc 20:00",
        time: "12:50"
    }
];

const Home = () => {
    const navigate = useNavigate();
    const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<Message | null>(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const moreIconRef = useRef<HTMLSpanElement | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }

        // Click outside to close settings
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.settings-dropdown') && !target.closest('.settings-trigger')) {
                setShowSettings(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [navigate]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleInput = () => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="home-container">
            {/* <div className="menu-left">
                <div className="menu-top">
                    <div className="avatar"  onClick={() => navigate('/setting/profile')}>
                        <img src="https://res.cloudinary.com/ds4v3awds/image/upload/v1743944990/l2eq6atjnmzpppjqkk1j.jpg" alt="User" />
                    </div>
                    <div className="menu-item active">
                        <MessageOutlined />
                    </div>
                    <div className="menu-item">
                        <ContactsOutlined />
                    </div>
                    <div className="menu-item">
                        <CheckSquareOutlined />
                    </div>
                </div>
                <div className="menu-bottom">
                    <div className="menu-item">
                        <CloudOutlined />
                    </div>
                    <div className="menu-item">
                        <CloudDownloadOutlined />
                    </div>
                    <div className="menu-item">
                        <BorderOuterOutlined />
                    </div>
                    <div className="menu-item">
                        <BarsOutlined />
                    </div>
                    <div 
                        className={`menu-item settings-trigger ${showSettings ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSettings(!showSettings);
                        }}
                    >
                        <SettingOutlined />
                    </div>
                </div>
            </div>

            {showSettings && (
                <div className="settings-dropdown">
                    <div className="menu-item">
                        <UserOutlined />
                        Thông tin tài khoản
                    </div>
                    <div className="menu-item">
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
            )} */}

            <div className="left-section">
                <div className="search-section">
                    <div className="search-input">
                        <FontAwesomeIcon icon={faSearch} />
                        <input type="text" placeholder="Tìm kiếm" />
                    </div>
                    <div className="icon-section">
                        <UserAddOutlined className="icon-adduser"/>
                        <UsergroupAddOutlined className="icon-addgroup"/>
                    </div>         
                </div>
                <div className="user-chat-section">
                    <div className="category-menu">
                        <div className="btn-section">
                            <a href="" className="btn-prioritize active">Ưu tiên</a>
                            <a href="" className="btn-other">Khác</a>
                        </div>
                        <div className="other-section">
                            <div className="classify">
                                <select name="" id="select" className="form-select">
                                    <option value="1">Phân loại</option>
                                    <option value="2">Nhóm</option>
                                    <option value="3">Cá nhân</option>
                                </select>
                            </div>
                            <EllipsisOutlined className="btn-ellip" />
                        </div>
                    </div>
                    <div className="list-mess">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`message-item ${selectedUser?.id === msg.id ? "selected" : ""}`}
                                onMouseEnter={() => setHoveredMessageId(msg.id)}
                                onMouseLeave={() => setHoveredMessageId(null)}
                                onClick={() => setSelectedUser(msg)}
                            >
                                <div className="avatar-icon">
                                    <UserOutlined />
                                </div>
                                <div className="message-content">
                                    <div className="message-header">
                                        <span className="message-name">{msg.name}</span>
                                        <span 
                                            className="message-time" 
                                            onClick={(e) => {
                                                setSelectedMessageId(msg.id);
                                                setIsModalOpen(true);
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const windowHeight = window.innerHeight;
                                                const modalHeight = 100;
                                                const topPosition = (rect.bottom + modalHeight > windowHeight -200)
                                                    ? rect.top - modalHeight - 10
                                                    : rect.bottom + 5;
                                                setModalPosition({
                                                    top: topPosition,
                                                    left: rect.left
                                                });
                                            }}
                                        >
                                            {hoveredMessageId === msg.id ? <MoreOutlined /> : msg.time}
                                        </span>
                                    </div>
                                    <div className="message-text">{msg.message}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Modal
                        isOpen={isModalOpen}
                        onRequestClose={() => setIsModalOpen(false)}
                        className="custom-modal"
                        overlayClassName="overlay"
                        style={{
                            content: {
                                top: `${modalPosition.top}px`,
                                left: `${modalPosition.left}px`,
                                transform: "translateY(0)",
                                position: "absolute",
                                width: "200px",
                                backgroundColor: "white",
                                border: "1px solid #ccc",
                                padding: "10px",
                                borderRadius: "5px"
                            }
                        }}
                    >
                        <h3>Tùy chọn tin nhắn</h3>
                        <button onClick={() => console.log("Sao chép")}>Sao chép tin nhắn</button>
                        <button onClick={() => console.log("Xóa")}>Xóa tin nhắn</button>
                        <button onClick={() => console.log("Báo cáo")}>Báo cáo tin nhắn</button>
                        <button onClick={() => setIsModalOpen(false)}>Đóng</button>
                    </Modal>
                </div>
            </div>
            <div className="right-section">
                {selectedUser ? (
                    <div className={`body-chat ${isSidebarOpen ? "shrink" : ""}`}>
                        <div className="header-chat">
                            <div className="info-chat">
                                <div className="avatar-icon">
                                    <UserOutlined />
                                </div>
                                <div className="title-chat">
                                    <span className="title-name">{selectedUser.name}</span>
                                    <span className="title-status">Đang hoạt động</span>
                                </div>
                            </div>
                            <div className="icon-section-chat">
                                <UsergroupAddOutlined className="icon-addgroup"/>
                                <VideoCameraOutlined className="icon-videochat"/>
                                <MenuFoldOutlined className="icon-menufold" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                            </div>
                        </div>
                        <div className="content-chat">
                            
                        </div>
                        <div className="footer-chat">
                            <div className="menu-section-chat">
                                <FontAwesomeIcon icon={faLaughBeam} />
                                <FontAwesomeIcon icon={faImage} />
                                <FontAwesomeIcon icon={faFileCirclePlus} />
                                <FontAwesomeIcon icon={faAddressCard} />
                            </div>
                            <div className="chat-section">
                                <textarea 
                                    ref={textAreaRef}
                                    className="chat-input"
                                    placeholder="Nhập tin nhắn..." 
                                    onInput={handleInput}
                                ></textarea>
                                <div className="menu-button">
                                    <FontAwesomeIcon icon={faLaughBeam} />
                                    <LikeFilled className="icon-menufold"/>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <h2>Chọn một cuộc trò chuyện</h2>
                )}
                {isSidebarOpen && (
                    <div className="sidebar-chat">
                        <div className="sidebar-header">
                            <p>Thông báo hội thoại</p>
                        </div>
                        <div className="sidebar-content">
                            <div className="header-info">
                                <div className="avatar-icon">
                                    <UserOutlined />
                                </div>
                                <div className="name-user">
                                    <p className="name-user">{selectedUser?.name}</p>
                                    <EditOutlined className="icon-edit"/>
                                </div>
                                <div className="btn-user-type">
                                    <div className="btn-unnotify">
                                        <BellOutlined className="icon-bell"/>
                                        <p className="text-icon">Tắt thông báo</p>
                                    </div>
                                    <div className="btn-pin">
                                        <PushpinOutlined className="icon-pin"/>
                                        <p className="text-icon"> Ghim hội thoại</p>
                                    </div>
                                    <div className="btn-addgroup">
                                        <UsergroupAddOutlined className="icon-usegroup"/>
                                        <p className="text-icon">Tạo nhóm trò chuyện</p>
                                    </div>
                                </div>
                            </div>
                            <div className="type">
                                <div className="btn-number-group">
                                    <FontAwesomeIcon icon={faUserGroup} />
                                    <p><span>4 </span>nhóm chung</p>
                                </div>
                            </div>
                            <div className="img-section">
                                <div className="header-img">
                                    <p>Ảnh/Video</p>
                                    {isCollapsed ? <CaretRightFilled className="icon-right" onClick={toggleCollapse}/> : <CaretDownFilled className="icon-right" onClick={toggleCollapse}/> }
                                </div>
                                {!isCollapsed && (
                                    <div className="p-4 grid grid-cols-3 gap-2">
                                        <div className="content-img"></div>
                                        <div className="footer-img">
                                            <div className="btn-orther-img">
                                                <p>Xem tất cả</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="file-section"></div>
                            <div className="link-section"></div>
                            <div className="security-section"></div>
                            <div className="footer-info"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
