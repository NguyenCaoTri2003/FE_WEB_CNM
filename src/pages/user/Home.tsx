import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '../../assets/styles/Home.css';
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faLaughBeam, faImage, faFileCirclePlus, faAddressCard, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import { UsergroupAddOutlined, UserAddOutlined, EllipsisOutlined, MoreOutlined, VideoCameraOutlined, MenuFoldOutlined, LikeFilled, BellOutlined, PushpinOutlined, EditOutlined, CaretRightFilled, CaretDownFilled, UserOutlined, SendOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from 'axios';
import { API_ENDPOINTS } from "config/api";

Modal.setAppElement("#root");

interface Message {
    messageId: string;
    senderEmail: string;
    receiverEmail: string;
    content: string;
    createdAt: string;
    status: string;
}

interface SendMessageResponse {
    success: boolean;
    data: Message;
}

interface GetMessagesResponse {
    success: boolean;
    data: Message[];
}


const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const friend = location.state;
    
    const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedUser, setSelectedUser] = useState<Message | null>(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCollapsedFile, setIsCollapsedFile] = useState(false);
    const [isCollapsedLink, setIsCollapsedLink] = useState(false);

    const [selectedUser, setSelectedUser] = useState(friend);

    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<Message[]>([]);

    //lướt xuống cùng
    const bottomRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (friend) {
          setSelectedUser(friend);
        }
      }, [friend]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };
    const toggleCollapseFile = () => {
        setIsCollapsedFile(!isCollapsedFile);
    };

    const toggleCollapseLink = () => {
        setIsCollapsedLink(!isCollapsedLink);
    };

    const handleInput = () => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const isNearBottom = () => {
        const el = chatContainerRef.current;
        if (!el) return false;
    
        const threshold = 150; // khoảng cách tính là "gần cuối"
        return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    };
    useEffect(() => {
        if (isNearBottom()) {
            scrollToBottom();
        }
    }, [chatMessages]);

    // Gửi tin nhắn

    const sendMessage = async () => {
        if (!message.trim()) return;
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post<SendMessageResponse>(
                API_ENDPOINTS.sendMessage,
                {
                    content: message,
                    receiverEmail: selectedUser.email
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            scrollToBottom();
            if (response.data.success) {
                setChatMessages(prev => [...prev, response.data.data]); // ✅ sửa ở đây
                setMessage('');
            }
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
        }
    };
    
    // Tải tin nhắn
    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchMessages = async () => {
            try {
                const response = await axios.get<GetMessagesResponse>(
                    `${API_ENDPOINTS.getMessages}${selectedUser.email}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setChatMessages(response.data.data); 
            } catch (error) {
                console.error("Lỗi khi tải tin nhắn:", error);
            }
        };
    
        fetchMessages();
        const interval = setInterval(fetchMessages, 1000); // Mỗi 3s tải lại
        return () => clearInterval(interval);
    }, [selectedUser]);

    function timeAgo(createdAt: string | Date): string {
        const now = new Date();
        const messageDate = new Date(createdAt);
      
        // Kiểm tra nếu createdAt không phải là một giá trị hợp lệ
        if (isNaN(messageDate.getTime())) {
          return "Invalid date";
        }
      
        const differenceInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
      
        const minutes = Math.floor(differenceInSeconds / 60);
        const hours = Math.floor(differenceInSeconds / 3600);
        const days = Math.floor(differenceInSeconds / 86400);
      
        if (minutes < 1) {
          return "Just now"; // Nếu dưới 1 phút
        } else if (minutes < 60) {
          return `${minutes} minute${minutes > 1 ? "s" : ""} ago`; // Nếu dưới 1 giờ
        } else if (hours < 24) {
          return `${hours} hour${hours > 1 ? "s" : ""} ago`; // Nếu dưới 1 ngày
        } else {
          return `${days} day${days > 1 ? "s" : ""} ago`; // Nếu trên 1 ngày
        }
    }

    
   

    return (
        <div className="home-container">
            <div className="right-section">
                {selectedUser ? (
                    <div className={`body-chat ${isSidebarOpen ? "shrink" : ""}`}>
                        <div className="header-chat">
                            <div className="info-chat">
                                <div className="avatar-icon">
                                    <img
                                        src={friend.avatar || "https://cdn.pixabay.com/photo/2025/03/18/17/03/dog-9478487_1280.jpg"}
                                        alt={friend.fullName}
                                    />
                                </div>
                                <div className="title-chat">
                                    <span className="title-name">{selectedUser.fullName}</span>
                                    <span className="title-status">Đang hoạt động</span>
                                </div>
                            </div>
                            <div className="icon-section-chat">
                                <UsergroupAddOutlined className="icon-addgroup"/>
                                <VideoCameraOutlined className="icon-videochat"/>
                                <MenuFoldOutlined className="icon-menufold" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                            </div>
                        </div>
                        <div className="content-chat"  ref={chatContainerRef}>
                            {chatMessages.map((msg) => (
                                <div
                                key={msg.messageId}
                                className={`message-item-chat ${msg.senderEmail === selectedUser.email ? 'received' : 'sent'}`}
                                >
                                <div className="message-content">{msg.content}</div>
                                <div className="message-time">{timeAgo(msg.createdAt)}</div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
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
                                    // onInput={handleInput}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onInput={handleInput}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                        }
                                    }}
                                ></textarea>
                                <div className="menu-button">
                                    <FontAwesomeIcon icon={faLaughBeam} />
                                    <SendOutlined className="icon-menufold" onClick={sendMessage}/>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <h2>Chọn một cuộc trò chuyện</h2>
                )}

                {/* Sidebar thông tin người dùng */}
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
                                    {!isCollapsed ? <CaretRightFilled className="icon-right" onClick={toggleCollapse}/> : <CaretDownFilled className="icon-right" onClick={toggleCollapse}/> }
                                </div>
                                {isCollapsed && (
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
                            <div className="file-section">
                                <div className="header-img">
                                    <p>File</p>
                                    {!isCollapsedFile ? <CaretRightFilled className="icon-right" onClick={toggleCollapseFile}/> : <CaretDownFilled className="icon-right" onClick={toggleCollapseFile}/> }
                                </div>
                                {isCollapsedFile && (
                                    <div className="p-4 grid grid-cols-3 gap-2">
                                        <div className="content-file"></div>
                                        <div className="footer-img">
                                            <div className="btn-orther-img">
                                                <p>Xem tất cả</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="link-section">
                                <div className="header-img">
                                    <p>Link</p>
                                    {!isCollapsedLink ? <CaretRightFilled className="icon-right" onClick={toggleCollapseLink}/> : <CaretDownFilled className="icon-right" onClick={toggleCollapseLink}/> }
                                </div>
                                {isCollapsedLink && (
                                    <div className="p-4 grid grid-cols-3 gap-2">
                                        <div className="content-link"></div>
                                        <div className="footer-img">
                                            <div className="btn-orther-img">
                                                <p>Xem tất cả</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
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