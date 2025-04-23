import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '../../assets/styles/Home.css';
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faLaughBeam, faImage, faFileCirclePlus, faAddressCard, faUserGroup } from "@fortawesome/free-solid-svg-icons";
//import Modal from "react-modal";
import { UsergroupAddOutlined, LeftOutlined, SettingOutlined, MoreOutlined, VideoCameraOutlined, MenuFoldOutlined, LikeFilled, DownloadOutlined , BellOutlined, PushpinOutlined, EditOutlined, CaretRightFilled, CaretDownFilled, UserOutlined, SendOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileZipOutlined, FileTextOutlined,PaperClipOutlined, CloseOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from 'axios';
import { API_ENDPOINTS } from "config/api";
import { Button, Modal } from "antd";
import 'antd/dist/reset.css';
import { useMessageContext } from "../../context/MessagesContext"

// Modal.setAppElement("#root");
// interface Reaction {
//     senderEmail: string;
//     reaction: string;
//     timestamp: string;
//   }

// interface Message {
//     messageId: string;
//     groupId?: string;
    
//     senderEmail: string;
//     receiverEmail: string;
//     content: string;
//     createdAt: string;
//     status: 'send' | 'received' | 'recalled';
//     type?: 'text' | 'image' | 'file';
//     isRecalled?: boolean;
//     // reactions?: Reaction[];
// }

interface SendMessageResponse {
    success: boolean;
    data: Message;
}

interface GetMessagesResponse {
    success: boolean;
    data: Message[];
}

interface Member {
    userId: string;
    fullName: string;
    avatar: string;
    role: string;
}

interface GroupResponse {
    success: boolean;
    data: {
      members: Member[];
    };
    message?: string;
}
interface Friend {
    userId: string;
    email: string;
    fullName: string;
    avatar: string; // optional
}
interface FriendResponse {
    success: boolean;
    data: Friend[];
}

type GroupType = {
    groupId: string;
    groupName: string;
    members: string[]; // array userId hoặc email tùy bạn backend trả gì
    messages: Message[]; // danh sách tin nhắn trong nhóm
    createdAt: string;
    updatedAt: string;
};

interface BaseMessage {
    messageId: string;
    senderEmail: string;
    content: string;
    createdAt: string;
    status: 'send' | 'received' | 'recalled';
    type?: 'text' | 'image' | 'file';
    isRecalled?: boolean;
}

export interface Message extends BaseMessage {
    receiverEmail: string;

}

export interface MessageGroup extends BaseMessage {
    groupId: string;
    senderId: string;
    senderName: string;
}

type SendGroupMessageResponse = {
success: boolean;
data: MessageGroup; // Cái MessageType mình gửi ở trên đó
};

type GetGroupMessagesResponse = {
    success: boolean;
    data: {
      messages: MessageGroup[];
    };
};

  type MessageType = {
    messageId: string;
    groupId?: string; // optional vì tin nhắn đơn thì không có groupId
    senderId: string;
    senderEmail: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'video';
    isDeleted: boolean;
    isRecalled: boolean;
    createdAt: string;
    updatedAt: string;
  };
  
  type FriendType = {
    userId: string;
    email: string;
    fullName: string;
    avatar: string;
    type: 'friend';
  };
  
  type GroupTypes = {
    groupId: string;
    groupName: string;
    type: 'group';
  };

  interface ApiResponse {
    success: boolean;
    message: string;
    [key: string]: any;
}

interface ApiResponseAdmin<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}
  
const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // const friend = location.state;
    const { friend, groupId } = location.state || {};
    // console.log(friend, groupId);
    
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
    const [selectedUserModal, setSelectedUserModal] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
    // const [selectedUser, setSelectedUser] = useState<FriendType | GroupTypes | null>(null);

    // const [selectedUser, setSelectedUser] = useState(selectedUserOrGroup);

    const [message, setMessage] = useState('');
    // const [chatMessages, setChatMessages] = useState<Message[]>([]);
    // const [chatMessages, setChatMessages] = useState<BaseMessage[]>([]);
    const [chatMessages, setChatMessages] = useState<(Message | MessageGroup)[]>([]);



    //lướt xuống cùng
    const bottomRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);


    //xóa tin nhắn
    const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
    // const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
    const [selectedMsg, setSelectedMsg] = useState<BaseMessage | null>(null);

    const [showModal, setShowModal] = useState(false);

    const { updateLastMessage } = useMessageContext()!;

    //hiển thị danh sách thành viên nhóm
    const [showList, setShowList] = useState(false);

    const [members, setMembers] = useState<Member[]>([]);

    const [isModalOpenGroup, setIsModalOpenGroup] = useState(false);

    const [friends, setFriends] = useState<Friend[]>([]); 
    const [groupMembers, setGroupMembers] = useState<string[]>([]); 
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]); 
    // console.log('location.state:', location.state);

    //tim kiếm bạn bè
    const [searchFriendTerm, setSearchFriendTerm] = useState('');  // ô nhập
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);  // danh sách đã lọc

    const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

    useEffect(() => {
        // Nếu không có từ khóa thì trả về toàn bộ friends
        if (!searchFriendTerm.trim()) {
            setFilteredFriends(friends);
        } else {
            // Lọc theo tên (fullName) hoặc email gần giống
            const filtered = friends.filter(friend =>
                friend.fullName.toLowerCase().includes(searchFriendTerm.toLowerCase()) ||
                friend.email.toLowerCase().includes(searchFriendTerm.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    }, [searchFriendTerm, friends]);  // mỗi lần đổi input hoặc friends mới thì lọc lại

    const menuRef = useRef<HTMLDivElement | null>(null); // Xác định kiểu cho ref

    // Sử dụng useEffect để đóng menu khi nhấn ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
    
            if (!target.closest('.menu-trigger') && !target.closest('.menu-options')) {
                setSelectedUserModal(''); // Nếu click không phải vào trigger/menu => đóng
            }
        };
    
        document.addEventListener('click', handleClickOutside);
    
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    
    const handleClearSearch = () => {
        setSearchFriendTerm('');
    };

    
    const showModalGroup = () => {
        setIsModalOpenGroup(true);
      };
    
      const handleCancelGroup = () => {
        setIsModalOpenGroup(false);
      };

      useEffect(() => {
        const fetchFriends = async () => {
          try {
            const token = localStorage.getItem("token");
            if (!token) {
              console.error("Người dùng chưa đăng nhập hoặc token không hợp lệ");
              return;
            }
    
            const response = await axios.get<FriendResponse>(`${API_ENDPOINTS.getFriends}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
    
            if (response.data.success) {
              setFriends(response.data.data);
            } else {
              console.error("Lỗi khi lấy danh sách bạn bè");
            }
          } catch (error) {
            console.error("Lỗi khi gọi API:", error);
          } finally {
            // setLoading(false);
          }
        };
    
        fetchFriends();
        
      }, []);
    
   

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

    const openListMember = () => {
        setShowList(!showList);
    }

    const closeListMember = () => {
        setShowList(false);
    }

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

    // const sendMessage = async () => {
    //     if (!message.trim()) return;
    
    //     try {
    //         const token = localStorage.getItem('token');
    //         const response = await axios.post<SendMessageResponse>(
    //             API_ENDPOINTS.sendMessage,
    //             {
    //                 content: message,
    //                 receiverEmail: selectedUser.email,
    //                 type: 'file',
    //             },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`
    //                 }
    //             }
    //         );
    //         scrollToBottom();
            

    //         if (response.data.success) {
    //             setChatMessages(prev => [...prev, response.data.data]); 

    //             //context mess
    //             const messageContent = message;
    //             const sentMsg = response.data.data;
    //             setChatMessages(prev => [...prev, sentMsg]);

    //             const timeSent = new Date(sentMsg.createdAt); // dùng thời gian từ backend cho chuẩn
    //             updateLastMessage(selectedUser.email, sentMsg.content, timeSent);

    //             setMessage('');
    //         }
    //     } catch (error) {
    //         console.error('Lỗi khi gửi tin nhắn:', error);
    //     }
    // };
    
    //gửi tin nhắn đơn và nhóm
    const sendMessage = async () => {
        if (!message.trim()) return;
    
        try {
            const token = localStorage.getItem('token');
            if (!selectedUser) return; // nếu chưa chọn ai cả thì return
    
            if (selectedUser.type === 'group') {
                // CHAT NHÓM
                const response = await axios.post<SendGroupMessageResponse>(
                    `${API_ENDPOINTS.sendMessageGroup(selectedUser.groupId)}`,
                    {
                        content: message,
                        type: 'text',
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
    
                if (response.data.success) {
                    const sentMsg = response.data.data;
                    setChatMessages(prev => [...prev, sentMsg]);
                    setMessage('');
                    scrollToBottom();
                }
            } else if (selectedUser.type === 'friend') {
                // CHAT ĐƠN
                const response = await axios.post<SendMessageResponse>(
                    API_ENDPOINTS.sendMessage,
                    {
                        content: message,
                        receiverEmail: selectedUser.email,
                        type: 'text',
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
    
                if (response.data.success) {
                    const sentMsg = response.data.data;
                    setChatMessages(prev => [...prev, sentMsg]);
                    const timeSent = new Date(sentMsg.createdAt);
                    updateLastMessage(selectedUser.email, sentMsg.content, timeSent);
                    setMessage('');
                    scrollToBottom();
                }
            }
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
        }
    };
    
    //tải tin nhắn
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const myEmail = user.email;
    
        const fetchMessages = async () => {
            try {
                if (!selectedUser) return;
    
                if (selectedUser.type === 'group') {
                    // CHAT NHÓM
                    const response = await axios.get<GetGroupMessagesResponse>(
                        `${API_ENDPOINTS.getMessagesGroup(selectedUser.groupId)}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    const messages = response.data.data.messages;
                    setChatMessages(messages);
                } else if (selectedUser.type === 'friend') {
                    // CHAT ĐƠN
                    const response = await axios.get<GetMessagesResponse>(
                        `${API_ENDPOINTS.getMessages}${selectedUser.email}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    const messages = response.data.data;
                    setChatMessages(messages);
    
                    if (messages.length > 0) {
                        const lastMsg = messages[messages.length - 1];
                        const isReceiver = lastMsg.senderEmail !== myEmail;
                        const friendEmail = isReceiver ? lastMsg.senderEmail : lastMsg.receiverEmail;
                        updateLastMessage(friendEmail, lastMsg.content, new Date(lastMsg.createdAt));
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải tin nhắn:", error);
            }
        };
    
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [selectedUser]);
    
    
    // Tải tin nhắn
    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     // const myEmail = localStorage.getItem('email');
    //     const user = JSON.parse(localStorage.getItem("user") || "{}");
    //     const myEmail = user.email;
    //     const fetchMessages = async () => {
    //         try {
    //             const response = await axios.get<GetMessagesResponse>(
    //                 `${API_ENDPOINTS.getMessages}${selectedUser.email}`,
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 }
    //             );
    //             setChatMessages(response.data.data); 
    //             const messages = response.data.data;
    //             if (messages.length > 0) {
    //                 const lastMsg = messages[messages.length - 1];
    //                 const isReceiver = lastMsg.senderEmail !== myEmail;
    //                 const friendEmail = isReceiver ? lastMsg.senderEmail : lastMsg.receiverEmail;
            
    //                 updateLastMessage(friendEmail, lastMsg.content, new Date(lastMsg.createdAt));
    //             }
    //         } catch (error) {
    //             console.error("Lỗi khi tải tin nhắn:", error);
    //         }
    //     };
    
    //     fetchMessages();
    //     const interval = setInterval(fetchMessages, 3000); // Mỗi 3s tải lại
    //     return () => clearInterval(interval);
    // }, [selectedUser]);

    
    

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
    
                

                if (selectedUser.type === 'group') {
                    // CHAT NHÓM
                    const response = await axios.post<SendGroupMessageResponse>(
                        `${API_ENDPOINTS.sendMessageGroup(selectedUser.groupId)}`,
                        {
                            content: result.data.url,
                            type: 'file',
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                } else if (selectedUser.type === 'friend') {
                    // Gửi tin nhắn chứa đường dẫn file
                    await axios.post(API_ENDPOINTS.sendMessage, {
                        receiverEmail: selectedUser.email,
                        content: result.data.url,
                        type: "file"
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }

    
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

    
      
    const handleRecallMessage = async (messageId?: string) => {
        const token = localStorage.getItem('token');
        if (!messageId) {
            console.warn("messageId bị thiếu khi recall");
            return;
        }
        // console.log("==> recall msg ID:", messageId);
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
            // console.log("==> Recall response", response.data);
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

    // const handleAddReaction = async (messageId: string, emoji: string) => {
    //     try {
    //         const res = await fetch('/api/reactions/add', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Authorization: `Bearer ${localStorage.getItem('token')}`, // nếu bạn dùng auth token
    //             },
    //             body: JSON.stringify({ messageId, reaction: emoji }),
    //         });
    
    //         const data = await res.json();
    //         if (data.success) {
    //             // Cập nhật danh sách tin nhắn (tùy bạn xử lý như thế nào)
    //             // Ví dụ: gọi lại API get messages, hoặc cập nhật react local state
    //             console.log('Reaction added!');
    //         } else {
    //             console.error(data.error);
    //         }
    //     } catch (err) {
    //         console.error('Error sending reaction:', err);
    //     }
    // };
    // console.log("GROUP ID: ", friend.groupId);
    const fetchGroupMembers = async () => {
        try {
          const token = localStorage.getItem('token');

          if (!groupId) {
              console.error('No groupId provided!');
              return;
          }
          
          // const groupID = friend.groupId;
          // console.log("groupid", groupID);
          const response = await axios.get<GroupResponse>(`${API_ENDPOINTS.getGroupMembers(groupId)}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
  
          if (response.data.success) {
              setMembers(response.data.data.members || []);
              const userIds = response.data.data.members.map(member => member.userId);
              setGroupMembers(userIds);
          } else {
            console.error('Error fetching group:', response.data.message);
          }
        } catch (error) {
          console.error('Error fetching group:', error);
        }
      };

    useEffect(() => {
        
        fetchGroupMembers();
    }, [groupId]);

    // console.log("Danh sách friends:", friends);
    // console.log("Danh sách groupMembers:", groupMembers);

    const handleAddMembers = async () => {
        if (selectedFriends.length === 0) {
          alert("Bạn chưa chọn thành viên nào để thêm!");
          return;
        }
      
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.error("Chưa đăng nhập");
            return;
          }
      
          // Dùng Promise.all để thêm nhiều thành viên cùng lúc
          await Promise.all(
            selectedFriends.map(async (memberId) => {
              await axios.post(`${API_ENDPOINTS.addGroupMembers(friend.groupId)}`, 
                { memberId },
                { headers: { Authorization: `Bearer ${token}` } }
              );
            })
          );
      
          // Sau khi thêm thành công, cập nhật groupMembers
          setGroupMembers((prev) => [...prev, ...selectedFriends]);
      
          // Xóa danh sách selectedFriends sau khi thêm xong
          setSelectedFriends([]);
      
          alert("Thêm thành viên thành công!");
      
        } catch (error) {
          console.error("Lỗi khi thêm thành viên:", error);
          alert("Có lỗi xảy ra khi thêm thành viên!");
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

    const handleRemoveMember = async (groupId?: string, memberId?: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Chưa đăng nhập");
                return;
            }
    
            if (!memberId || !groupId) {
                console.error("Thiếu thông tin groupId hoặc memberId");
                return;
            }

            if (members.length <= 3) {
                alert("Nhóm chỉ còn 3 thành viên, không thể xóa thêm!");
                return;
            }
    
            const response = await axios.delete(
                `${API_ENDPOINTS.removeGroupMembers(groupId, memberId)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
    
            if (response.status === 200) {
                setMembers(prev => prev.filter(member => member.userId !== memberId));
                setGroupMembers(prev => prev.filter(member => member !== memberId)); 
                fetchGroupMembers(); 
                setSelectedUserModal('');
                alert("Xóa thành viên thành công!");
            } else {
                alert('Xóa thành viên thất bại');
            }
        } catch (error: any) {
            console.error("Lỗi khi xóa thành viên:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Xóa thành viên thất bại!");
        }
    };
    
    const addAdminToGroup = async (groupId: string, adminId: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Chưa đăng nhập");
                return;
            }
    
            const response = await axios.post<ApiResponseAdmin>(
                `${API_ENDPOINTS.addAdmin(groupId)}`,  // <-- chú ý route nè
                { adminId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (response.data.success) {
                alert('Đã thêm thành viên thành admin!');
                fetchGroupMembers(); 
                // Optionally: Reload group info if you want
            } else {
                alert('Thêm admin thất bại!');
            }
        } catch (error: any) {
            console.error("Lỗi khi thêm admin:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Thêm admin thất bại!");
        }
    };

    const handleRemoveAdmin = async (groupId?: string, adminId?: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Chưa đăng nhập');
                return;
            }
            if (!groupId || !adminId) {
                console.error('Thiếu thông tin groupId hoặc adminId');
                return;
            }
    
            const response = await axios.delete<ApiResponse>(
                `${API_ENDPOINTS.removeAdmin(groupId)}`, // API_ENDPOINTS bạn tự config nhé
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        adminId: adminId, // Gửi memberId qua params
                    },
                }
            );
    
            if (response.data.success) {
                alert('Đã xóa quyền admin của thành viên thành công!');
                // Optional: Cập nhật lại danh sách admin
                fetchGroupMembers(); 
            } else {
                alert(response.data.message || 'Xóa quyền admin thất bại!');
            }
        } catch (error: any) {
            console.error('Lỗi khi xóa admin:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Xóa quyền admin thất bại!');
        }
    };

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = user.userId || user.id;
    
      

    return (
        <div className="home-container">
            <div className="right-section">
                {selectedUser ? (
                    <div className={`body-chat ${isSidebarOpen ? "shrink" : ""}`}>
                        <div className="header-chat">
                            <div className="info-chat">
                                <div className="avatar-icon">
                                    <img
                                        src={selectedUser.avatar || "https://cdn.pixabay.com/photo/2025/03/18/17/03/dog-9478487_1280.jpg"}
                                        alt={selectedUser.type === "friend" ? selectedUser.fullName : selectedUser.name}
                                    />
                                </div>
                                <div className="title-chat">
                                    <span className="title-name">{selectedUser.type === "friend" ? selectedUser.fullName : selectedUser.name}</span>
                                    <span className="title-status">Đang hoạt động</span>
                                </div>
                            </div>
                            <div className="icon-section-chat">
                                <UsergroupAddOutlined className="icon-addgroup"/>
                                <VideoCameraOutlined className="icon-videochat"/>
                                <MenuFoldOutlined className="icon-menufold" onClick={() => {
                                    setIsSidebarOpen(!isSidebarOpen);
                                    closeListMember();
                                }} />
                            </div>
                        </div>
                        <div className="content-chat" ref={chatContainerRef}>
                            {chatMessages.map((msg) => {
                                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.content);
                                // const filename = msg.content.split('/').pop();
                                const isFile = /\.(pdf|docx?|xlsx?|zip|rar|txt)$/i.test(msg.content);
                                const isVideo = /\.(mp4|avi|mov|wmv)$/i.test(msg.content);
                                const filename = msg.content.split('/').pop() ?? '';
                                const fileIcon = getFileIcon(filename);
                                const isOwnMessagekhac = msg.senderEmail !== selectedUser.email;

                                const user = JSON.parse(localStorage.getItem("user") || "{}");
                                const isOwnMessage = msg.senderEmail == user.email;
                                // console.log("isOwnMessage", isOwnMessage);
                                // console.log('Sender Email of msg:', msg.senderEmail);
                                // console.log('Current User Email:', selectedUser.email);

                                const isGroupChat = selectedUser.type === 'group';

                                const messageClass = isGroupChat
                                ? (isOwnMessage ? 'sent' : 'received')
                                : (msg.senderEmail === selectedUser.email ? 'received' : 'sent');
                                

                                return (
                                    <div
                                        key={msg.messageId}
                                        className={`message-item-chat ${messageClass}`}
                                        onMouseEnter={() => setHoveredMsgId(msg.messageId)}
                                        onMouseLeave={() => setHoveredMsgId(null)}
                                    >
                                    <div className="message-content">
                                         {/* Nếu là group và không phải tin nhắn của mình thì hiển thị tên */}
                                        {isGroupChat && !isOwnMessage && (
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>
                                            {msg.senderEmail}
                                            </div>
                                        )}
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
                                        {hoveredMsgId === msg.messageId && isOwnMessagekhac && (
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
                                                    // console.log("Clicked more options");
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
                                    <img
                                        src={selectedUser.avatar || "https://cdn.pixabay.com/photo/2025/03/18/17/03/dog-9478487_1280.jpg"}
                                        alt={selectedUser.type === "friend" ? selectedUser.fullName : selectedUser.name}
                                    />
                                </div>
                                <div className="name-user">
                                    <p className="name-user">{selectedUser.type === "friend" ? selectedUser.fullName : selectedUser.name}</p>
                                    <EditOutlined className="icon-edit"/>
                                </div>
                                
                                {selectedUser.type === "friend" && (
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
                                )}

                                {selectedUser.type === "group" && (
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
                                            <p className="text-icon">Thêm thành viên</p>
                                        </div>
                                        <div className="btn-addgroup">
                                            <SettingOutlined className="icon-usegroup"/>
                                            <p className="text-icon">Quản lý nhóm</p>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {selectedUser.type === "group" && (
                                <div className="type">
                                    <div className="btn-number-group" onClick={openListMember}>
                                        <FontAwesomeIcon icon={faUserGroup} />
                                        <p><span>{members.length}</span> thành viên</p>
                                    </div>
                                </div>
                            )}

                            

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

                {/* hiển thị danh sách thành viên */}
                {showList && (
                    
                    <div className="list-member-group" >
                        <LeftOutlined className="icon-usegroup" onClick={closeListMember}/>
                        <p>Danh sách thành viên</p>
                        <div className="btn-add-mem" onClick={showModalGroup}>
                            <p>Thêm thành viên</p>
                        </div>
                        <div className="list-member">
                            {members.map(member => (
                                <div 
                                    key={member.userId} 
                                    className="item-mem" 
                                    onMouseEnter={() => setOpenMenuUserId(member.userId)}
                                    onMouseLeave={() => setOpenMenuUserId(null)}
                                    style={{ position: "relative" }}
                                >
                                    <div className="avatar-mem">
                                        <img src={member.avatar} alt="" />
                                    </div>
                                    <div className="name-mem">
                                        <p>{member.fullName}</p>
                                        <span>{member.role}</span>
                                        
                                    </div>
                                    {openMenuUserId === member.userId && (
                                        <div className="menu-trigger" onClick={(e) => {
                                            e.stopPropagation(); // Ngăn click từ trigger bị đẩy ra ngoài
                                            setSelectedUserModal(member.userId);
                                        }}>
                                            ...
                                        </div>
                                    )}
                                    
                                    {selectedUserModal === member.userId && (
                                        
                                        <div className="menu-options" ref={menuRef}>
                                            {/* Nếu không phải là admin thì hiển thị nút "Làm admin" */}
                                            {member.userId !== currentUserId && member.role !== 'admin' && (
                                                <div className="menu-item" onClick={() => addAdminToGroup(groupId, member.userId)}>Làm admin</div>
                                            )}

                                            {/* Nếu là admin thì hiển thị nút "Xóa quyền admin" */}
                                            {member.userId !== currentUserId && member.role == 'admin' && (
                                                <div className="menu-item" onClick={() => handleRemoveAdmin(groupId, member.userId)}>Xóa quyền admin</div>
                                            )}

                                            {/* Nút "Xóa thành viên" luôn hiển thị */}
                                            {member.userId !== currentUserId && (
                                                <div className="menu-item" onClick={() => handleRemoveMember(groupId, member.userId)}>
                                                    Xóa thành viên
                                                </div>
                                            )}
                                            {member.userId == currentUserId && (
                                                <div className="menu-item">
                                                    Rời nhóm
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                            ))}

                            
                        </div>
                    </div>
                )}
                {/* modal hiển thị thêm thành viên */}
                <Modal 
                    visible={isModalOpenGroup} // dùng 'visible' thay vì 'isOpen' hoặc 'open'
                    onCancel={handleCancelGroup}  
                    className="create-group-modal" 
                    footer={null}
                >
                    <div className="modal-content">
                        <div className="title-modal title-create-group">
                            <p>Thêm thành viên nhóm</p>
                            
                        </div>
        
                        <div className="create-search">
                            <div className="search-mem">
                                <FontAwesomeIcon icon={faSearch} />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm thành viên..."
                                    // value={searchFriendTerm}
                                    // onChange={(e) => setSearchFriendTerm(e.target.value)}
                                    // onKeyDown={(e) => {
                                    // if (e.key === 'Enter') {
                                    //     handleSearchFriend();
                                    // }
                                    // }}
                                    value={searchFriendTerm}
                                    onChange={(e) => setSearchFriendTerm(e.target.value)}
                                />
                                {searchFriendTerm && (
                                    <span className="clear-search" onClick={handleClearSearch}>
                                    ✖
                                    </span>
                                )}
                            </div>
                        </div>
        
                        <div className="content-mem">
                        <p>Bạn bè của bạn</p>
                        <div className="list-mem">
                            {filteredFriends.length > 0 && groupMembers.length > 0 ? (
                                
                                filteredFriends.map((friend) => (
                                
                                <div className="user-item group-item" key={friend.userId}>
                                <label className="info-user">
                                    <input
                                        type="checkbox"
                                        style={{ marginRight: '8px' }}
                                        checked={groupMembers.includes(friend.userId) || selectedFriends.includes(friend.userId)}
                                        disabled={groupMembers.includes(friend.userId)} // đã là thành viên thì disable luôn, không cho bỏ chọn
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                              setSelectedFriends((prev) => [...prev, friend.userId]);
                                            } else {
                                              setSelectedFriends((prev) => prev.filter(id => id !== friend.userId));
                                            }
                                        }}
                                    />
                                    <img src={friend.avatar} alt="User" />
                                    <div className="user-name">{friend.fullName}</div>
                                </label>
                                </div>
                            ))
                            ) : (
                            <div className="no-friends-found">Không có bạn bè phù hợp.</div>
                            )} 
                        </div>
        
                        </div>
        
                        <div className="btn-group">
                            <button className="btn-cancle" onClick={handleCancelGroup}>Hủy</button>
                            <button className={`btn-create-group ${selectedFriends.length >= 1 ? 'active-group' : ''}`} onClick={handleAddMembers}>Thêm thành viên</button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Home;