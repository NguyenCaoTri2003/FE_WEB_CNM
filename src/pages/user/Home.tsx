import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '../../assets/styles/Home.css';
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import { UsergroupAddOutlined, UserAddOutlined, EllipsisOutlined, MoreOutlined, VideoCameraOutlined, MenuFoldOutlined } from "@ant-design/icons";
Modal.setAppElement("#root");
interface Message {
    id: number;
    name: string;
    message: string;
    time: string;
    avatar: string;
}
const messages: Message[]  = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        message: "Bạn có rảnh không. jhfgduiofjhbskjdlfdjdnskjlfjdkslfjndklfmn",
        time: "14:30",
        avatar: "img/avt1.jpg"
    },
    {
        id: 2,
        name: "Trần Thị B",
        message: "Tối nay đi chơi nhé!",
        time: "13:15",
        avatar: "img/avt1.jpg"
    },
    {
        id: 3,
        name: "Nhóm bạn bè",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    }
    ,
    {
        id: 4,
        name: "Nhóm bạn bè 4",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    }
    ,
    {
        id: 5,
        name: "Nhóm bạn bè 5",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    }
    ,
    {
        id: 6,
        name: "Nhóm bạn bè 6",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    }
    ,
    {
        id: 7,
        name: "Nhóm bạn bè 7",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    }
    ,
    {
        id: 8,
        name: "Nhóm bạn bè 8",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    },
    {
        id: 9,
        name: "Nhóm bạn bè 9",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    },
    {
        id: 10,
        name: "Nhóm bạn bè 10",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    },
    {
        id: 11,
        name: "Nhóm bạn bè 11",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    },
    {
        id: 12 ,
        name: "Nhóm bạn bè 12",
        message: "Họp nhóm lúc 20:00",
        time: "12:50",
        avatar: "img/avt1.jpg"
    }

];

const Home = () => {

    const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<Message | null>(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    
    const moreIconRef = useRef<HTMLSpanElement | null>(null);

    return (
        <div className="home-container">
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
                                <img className='img-user' src={msg.avatar} alt="icon-user" />
                                <div className="message-content">
                                    <div className="message-header">
                                        <span className="message-name">{msg.name}</span>
                                        <span 
                                            // className="message-time" 
                                            // onClick={() => {
                                            //     setSelectedMessageId(msg.id);
                                            //     setIsModalOpen(true);
                                            // }}
                                            // ref={moreIconRef}
                                            className="message-time" 
                                            onClick={(e) => {
                                                setSelectedMessageId(msg.id);
                                                setIsModalOpen(true);
                                        
                                                // Lấy vị trí của icon ba chấm
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const windowHeight = window.innerHeight;
                                                const modalHeight = 100; // Giả sử modal cao 100px
                                        
                                                // Nếu icon gần đáy màn hình, hiển thị modal phía trên icon
                                                const topPosition = (rect.bottom + modalHeight > windowHeight -200)
                                                    ? rect.top - modalHeight - 10 // Hiển thị trên
                                                    : rect.bottom + 5; // Hiển thị dưới
                                        
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
                    {/* Modal */}
                <Modal
                    // isOpen={isModalOpen}
                    // onRequestClose={() => setIsModalOpen(false)}
                    // className="custom-modal"
                    // overlayClassName="overlay"
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
                    <div className="body-chat">
                        <div className="header-chat">
                            <div className="info-chat">
                                <img className='img-user' src={selectedUser.avatar} alt="icon-user" />
                                <div className="title-chat">
                                    <span className="title-name">{selectedUser.name}</span>
                                    <span className="title-status">Đang hoạt động</span>
                                </div>
                            </div>
                            <div className="icon-section-chat">
                                <UsergroupAddOutlined className="icon-addgroup"/>
                                <VideoCameraOutlined className="icon-videochat"/>
                                <MenuFoldOutlined className="icon-menufold"/>
                            </div>
                        </div>
                        <div className="content-chat">

                        </div>
                        <div className="footer-chat">

                        </div>
                    </div>
                ) : (
                    <h2>Chọn một cuộc trò chuyện</h2>
                )}
            </div>
        </div>
    );
};

export default Home;
