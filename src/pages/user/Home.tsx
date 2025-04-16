import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '../../assets/styles/Home.css';
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faLaughBeam, faImage, faFileCirclePlus, faAddressCard, faUserGroup } from "@fortawesome/free-solid-svg-icons";
//import Modal from "react-modal";
import { UsergroupAddOutlined, UserAddOutlined, EllipsisOutlined, MoreOutlined, VideoCameraOutlined, MenuFoldOutlined, LikeFilled, DownloadOutlined , BellOutlined, PushpinOutlined, EditOutlined, CaretRightFilled, CaretDownFilled, UserOutlined, SendOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileZipOutlined, FileTextOutlined,PaperClipOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from 'axios';
import { API_ENDPOINTS } from "config/api";
import { Button, Modal } from "antd";
import 'antd/dist/reset.css';
import { useMessageContext } from "../../context/MessagesContext"

// Modal.setAppElement("#root");

interface Message {
    messageId: string;
    senderEmail: string;
    receiverEmail: string;
    content: string;
    createdAt: string;
    status: 'seand' | 'received' | 'recalled';
    type?: 'text' | 'image' | 'file';
    isRecalled?: boolean;
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

    //xóa tin nhắn
    const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
    const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
    const [showModal, setShowModal] = useState(false);

    const { updateLastMessage } = useMessageContext()!;
   

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
        // setTimeout(() => {
        //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        //   }, 100);
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
                    receiverEmail: selectedUser.email,
                    type: 'file',
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            scrollToBottom();
            

            if (response.data.success) {
                setChatMessages(prev => [...prev, response.data.data]); 

                //context mess
                const messageContent = message;
                const sentMsg = response.data.data;
                setChatMessages(prev => [...prev, sentMsg]);

                const timeSent = new Date(sentMsg.createdAt); // dùng thời gian từ backend cho chuẩn
                updateLastMessage(selectedUser.email, sentMsg.content, timeSent);

                setMessage('');
            }
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
        }
    };
    
    // Tải tin nhắn
    useEffect(() => {
        const token = localStorage.getItem('token');
        // const myEmail = localStorage.getItem('email');
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const myEmail = user.email;
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
                const messages = response.data.data;
                if (messages.length > 0) {
                    const lastMsg = messages[messages.length - 1];
                    const isReceiver = lastMsg.senderEmail !== myEmail;
                    const friendEmail = isReceiver ? lastMsg.senderEmail : lastMsg.receiverEmail;
            
                    updateLastMessage(friendEmail, lastMsg.content, new Date(lastMsg.createdAt));
                }
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
          return "Vừa gửi"; // Nếu dưới 1 phút
        } else if (minutes < 60) {
          return `${minutes} phút trước`; // Nếu dưới 1 giờ
        } else if (hours < 24) {
          return `${hours} giờ trước`; // Nếu dưới 1 ngày
        } else {
          return `${days} ngày trước`; // Nếu trên 1 ngày
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const token = localStorage.getItem('token');
        const file = e.target.files?.[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch(API_ENDPOINTS.uploadFile, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData
            });
    
            const result = await response.json();
    
            if (result.success) {
                console.log('Tải lên thành công:', result.data);
    
                // Gửi tin nhắn chứa đường dẫn file
                await axios.post(API_ENDPOINTS.sendMessage, {
                    receiverEmail: selectedUser.email,
                    content: result.data.url,
                    type: "file"
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
    
            } else {
                console.error('Lỗi upload:', result.message);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    
    
    const getFileIcon = (filename: string) => {
        const extension = filename.split('.').pop()?.toLowerCase();
      
        switch (extension) {
          case 'pdf':
            return <FilePdfOutlined style={{ color: 'red', fontSize: 20 }} />;
          case 'doc':
          case 'docx':
            return <FileWordOutlined style={{ color: 'blue', fontSize: 20 }} />;
          case 'xls':
          case 'xlsx':
            return <FileExcelOutlined style={{ color: 'green', fontSize: 20 }} />;
          case 'zip':
          case 'rar':
            return <FileZipOutlined style={{ color: 'gray', fontSize: 20 }} />;
          case 'txt':
            return <FileTextOutlined style={{ color: 'black', fontSize: 20 }} />;
          default:
            return <PaperClipOutlined style={{ fontSize: 20 }} />;
        }
    };

    // Xóa tin nhắn
    const handleDeleteMessage = async (messageId?: string) => {
        const token = localStorage.getItem('token');
        
        if (!messageId) return;
        try {
          await axios.delete(`${API_ENDPOINTS.deleteMessage(messageId)}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (err) {
          console.error('Lỗi khi xóa tin nhắn:', err);
        }
    };
      
    const handleRecallMessage = async (messageId?: string) => {
        const token = localStorage.getItem('token');
        if (!messageId) {
            console.warn("messageId bị thiếu khi recall");
            return;
        }
        console.log("==> recall msg ID:", messageId);
        try {
            const response = await axios.put(`${API_ENDPOINTS.recall(messageId)}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const updatedMsg = (response.data as { data: Message }).data;

            setChatMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.messageId === updatedMsg.messageId ? updatedMsg : msg
            )
            );
            console.log("==> Recall response", response.data);
        } catch (err: any) {
            console.error('Lỗi khi thu hồi tin nhắn:', err.response?.data || err.message);
        }
    };

    // 2 phút là không thu hồi
    const canRecallMessage = (createdAt: string) => {
        const now = new Date().getTime();
        const msgTime = new Date(createdAt).getTime();
        const twoMinutes = 2 * 60 * 1000;
        return now - msgTime <= twoMinutes;
    };
      

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
                        {/* <div className="content-chat"  ref={chatContainerRef}>
                            
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
                        </div> */}
                        <div className="content-chat" ref={chatContainerRef}>
                            {chatMessages.map((msg) => {
                                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.content);
                                // const filename = msg.content.split('/').pop();
                                const isFile = /\.(pdf|docx?|xlsx?|zip|rar|txt)$/i.test(msg.content);
                                const filename = msg.content.split('/').pop() ?? '';
                                const fileIcon = getFileIcon(filename);
                                const isOwnMessage = msg.senderEmail !== selectedUser.email;
                                

                                return (
                                    <div
                                        key={msg.messageId}
                                        className={`message-item-chat ${msg.senderEmail === selectedUser.email ? 'received' : 'sent'}`}
                                        onMouseEnter={() => setHoveredMsgId(msg.messageId)}
                                        onMouseLeave={() => setHoveredMsgId(null)}
                                    >
                                    <div className="message-content">
                                        {msg.isRecalled ? (
                                            <i style={{ color: 'gray' }}>Tin nhắn đã được thu hồi</i>
                                        ) : msg.type === 'image' ||  isImage ? (
                                        <a href={msg.content} target="_blank" rel="noopener noreferrer">
                                            <img
                                            src={msg.content}
                                            alt="img"
                                            style={{ maxWidth: 200, borderRadius: 8 }}
                                            />
                                        </a>
                                        ) : isFile ? (
                                        <div
                                            // href={msg.content}
                                            // target="_blank"
                                            // rel="noopener noreferrer"
                                            // style={{ textDecoration: 'underline', color: '#007bff' }}
                                            className="file-chat"
                                        >
                                            <div className="file-chat-icon">
                                                <span className="file-icon"> {fileIcon} </span>
                                                <span className="file-name">{filename}</span>
                                            </div>
                                            <a 
                                                href={msg.content}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="file-download"
                                            >
                                                <DownloadOutlined/>
                                            </a>
                                        </div>
                                        ) : (
                                            msg.content
                                        )}
                                        {hoveredMsgId === msg.messageId && isOwnMessage && (
                                            <div
                                                className="message-options"
                                                style={{
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    setSelectedMsg(msg);
                                                    setShowModal(true);
                                                    console.log("Clicked more options");
                                                }}
                                            >
                                                <MoreOutlined />
                                            </div>

                                            
                                            )}

                                            <Modal
                                                open={showModal}
                                                onCancel={() => setShowModal(false)}
                                                footer={null}
                                                title="Tùy chọn tin nhắn"
                                            >
                                                <Button
                                                    type="primary"
                                                    danger
                                                    onClick={() => {
                                                        handleDeleteMessage(selectedMsg?.messageId);
                                                        setShowModal(false);
                                                    }}
                                                    style={{ marginBottom: 10 }}
                                                    block
                                                >
                                                    Xóa tin nhắn
                                                </Button>

                                                {/* Chỉ hiển thị nếu trong 2 phút */}
                                                {selectedMsg && canRecallMessage(selectedMsg.createdAt) && (
                                                    <Button
                                                    onClick={() => {
                                                        handleRecallMessage(selectedMsg?.messageId);
                                                        setShowModal(false);
                                                    }}
                                                        block
                                                    >
                                                        Thu hồi tin nhắn
                                                    </Button>
                                                )}
                                            </Modal>
                                    </div>
                                    <div className="message-time">{timeAgo(msg.createdAt)}</div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                        
                        {/* Modal xóa tin nhắn */}
                        

                        <div className="footer-chat">
                            <div className="menu-section-chat">
                                <FontAwesomeIcon icon={faLaughBeam} />
                                {/* thêm ảnh */}
                                <input
                                    type="file"
                                    id="imgInput"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <button onClick={() => document.getElementById('imgInput')?.click()} className="btn-file">
                                <FontAwesomeIcon icon={faImage} />
                                </button>
                                
                                {/* thêm file */}
                                <input
                                    type="file"
                                    id="fileInput"
                                    // accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <button onClick={() => document.getElementById('fileInput')?.click()} className="btn-file">
                                <FontAwesomeIcon icon={faFileCirclePlus} />
                                </button>

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