import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '../../assets/styles/Home.css';
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faLaughBeam, faImage, faFileCirclePlus, faAddressCard, faUserGroup, faKey, faPencil } from "@fortawesome/free-solid-svg-icons";
//import Modal from "react-modal";
import { UsergroupAddOutlined, LeftOutlined, SettingOutlined, MoreOutlined, VideoCameraOutlined, MenuFoldOutlined, DeleteOutlined, DownloadOutlined , BellOutlined, PushpinOutlined, EditOutlined, CaretRightFilled, CaretDownFilled, UserOutlined, SendOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileZipOutlined, FileTextOutlined,PaperClipOutlined, CloseOutlined, CameraFilled, DownOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from 'axios';
import { API_ENDPOINTS } from "config/api";
import { Button, Input, Modal, notification, Select } from "antd";
import 'antd/dist/reset.css';
import { useMessageContext } from "../../context/MessagesContext";
import { useUnreadMessages } from '../../context/UnreadMessagesContext'; 
import { useGroupContext } from "../../context/GroupContext";
import socket from "../../routes/socket";
import EmojiPicker from 'emoji-picker-react';

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
    phoneNumber?: string; // optional
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

type Reaction = {
    senderEmail: string;
    reaction: string;
    timestamp: string;
};

interface BaseMessage {
    messageId: string;
    senderEmail: string;
    receiverEmail?: string; 
    content: string;
    createdAt: string;
    status: 'send' | 'received' | 'recalled' | 'read';
    type?: 'text' | 'image' | 'file';
    isRecalled?: boolean;
    reactions?: Reaction[];
    isSystem?: boolean;
    action?: string; 
    groupId?: string;
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
type UploadAvatarResponse = {
    success: boolean;
    avatarUrl: string;
    message?: string;
  };

  interface UserResponse{
    success: boolean;
    user: {
        fullName?: string;
        email: string;
        avatar?: string;
    };
};
  
const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { friend, groupId } = location.state || {};
    const { groups, fetchGroups, setGroups } = useGroupContext();
    
    const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCollapsedFile, setIsCollapsedFile] = useState(false);
    const [isCollapsedLink, setIsCollapsedLink] = useState(false);

    const [selectedUser, setSelectedUser] = useState(friend);
    const [selectedUserModal, setSelectedUserModal] = useState('');

    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<(Message | MessageGroup)[]>([]);



    //lướt xuống cùng
    const bottomRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);


    //xóa tin nhắn
    const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
    const [selectedMsg, setSelectedMsg] = useState<BaseMessage | null>(null);

    const [showModal, setShowModal] = useState(false);

    const { updateLastMessage } = useMessageContext()!;
    const { addUnreadMessage } = useUnreadMessages();

    //hiển thị danh sách thành viên nhóm
    const [showList, setShowList] = useState(false);

    const [members, setMembers] = useState<Member[]>([]);

    const [isModalOpenGroup, setIsModalOpenGroup] = useState(false);

    const [friends, setFriends] = useState<Friend[]>([]); 
    const [groupMembers, setGroupMembers] = useState<string[]>([]); 
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]); 

    //tim kiếm bạn bè
    const [searchFriendTerm, setSearchFriendTerm] = useState('');  // ô nhập
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);  // danh sách đã lọc

    const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
    const [editedName, setEditedName] = useState("");

    const [userMap, setUserMap] = useState<{ [key: string]: { name: string; avatar: string } }>({});

    const [friendStatuses, setFriendStatuses] = useState<{ [email: string]: boolean }>({});

    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    const [showOptions, setShowOptions] = useState(false);
    const [openOptionsMsgId, setOpenOptionsMsgId] = useState<string | null>(null);
    const [selectedMessageId, setSelectedMessageId] = useState(null);

    const optionsRef = useRef<HTMLDivElement>(null); // div chứa menu
    const moreButtonRef = useRef<HTMLDivElement>(null); // dấu ba chấm

    const hideOptionsTimeout = useRef<NodeJS.Timeout | null>(null);

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isHoveringEmojiPicker, setIsHoveringEmojiPicker] = useState(false);

    const [isModalOpenUser, setIsModalOpenUser] = useState(false);

    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const [allowMemberInvite, setAllowMemberInvite] = useState(false);

    const [showForwardModal, setShowForwardModal] = useState(false);
    const [forwardTarget, setForwardTarget] = useState('');

    const reactionsList = ['👍', '❤️', '😂', '😮', '😢', '👎'];

    const handleUserClick = (user: any) => {
        setSelectedUser(user);
        setIsModalOpenUser(true);
    };

    const handleCloseModal = () => {
        setIsModalOpenUser(false);
    };

    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
            setShowScrollToBottom(!isAtBottom);
        };

        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToBottomAll = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };


    // const handleReactMessage = async (messageId: string, reaction: string) => {
    //     try {
    //         const isGroup = selectedUser.type === 'group';
    //         const url = isGroup
    //             ? `${API_ENDPOINTS.reactionGroup(groupId, messageId)}`
    //             : `${API_ENDPOINTS.reaction}`;
    
    //         const payload = isGroup
    //             ? { reaction }
    //             : { messageId, reaction };
    
    //         await axios.post(url, payload, {
    //             headers: {
    //                 Authorization: `Bearer ${localStorage.getItem("token")}`
    //             }
    //         });
    
    //         // Gọi lại dữ liệu tin nhắn nếu cần thiết, hoặc update local
    //         // fetchMessages(); // nếu có
    //     } catch (error) {
    //         console.error('Lỗi khi gửi reaction:', error);
    //     }
    // };

    // useEffect(() => {
    //     if (showEmojiPicker) {
    //         const timeout = setTimeout(() => {
    //             if (!isHoveringEmojiPicker) {
    //                 setShowEmojiPicker(false);
    //             }
    //         }, 5000); // sau 5 giây nếu không hover thì đóng

    //         return () => clearTimeout(timeout);
    //     }
    // }, [showEmojiPicker, isHoveringEmojiPicker]);

    const handleReactMessage = async (messageId: string, reaction: string) => {
        try {
            const isGroup = selectedUser.type === 'group';
            const url = isGroup
                ? `${API_ENDPOINTS.reactionGroup(groupId, messageId)}`
                : `${API_ENDPOINTS.reaction}`;

            const payload = isGroup
                ? { reaction }
                : { messageId, reaction };

            await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            // 🔔 Gửi cho người khác qua socket
            socket.emit("messageReaction", {
                messageId,
                reaction,
                receiverEmail: isGroup ? null : selectedUser.email,
            });

            // ✅ Cập nhật UI local cho chính mình
            handleMessageReaction({
                messageId,
                reaction,
                senderEmail: currentUserEmail, // 👈 chính bạn
            });

        } catch (error) {
            console.error('Lỗi khi gửi reaction:', error);
        }
    };

    const handleMessageReaction = ({ messageId, reaction, senderEmail }: {
        messageId: string;
        reaction: string;
        senderEmail: string;
    }) => {
        setChatMessages((prevMessages) =>
            prevMessages.map((msg) => {
                if (msg.messageId !== messageId) return msg;

                const reactions = msg.reactions || [];
                const existing = reactions.find(r => r.senderEmail === senderEmail);
                let newReactions;

                if (existing && existing.reaction === reaction) {
                    newReactions = reactions.filter(r => r.senderEmail !== senderEmail);
                } else if (existing) {
                    newReactions = reactions.map(r =>
                        r.senderEmail === senderEmail ? { ...r, reaction, timestamp: new Date().toISOString() } : r
                    );
                } else {
                    newReactions = [...reactions, {
                        senderEmail,
                        reaction,
                        timestamp: new Date().toISOString()
                    }];
                }

                return { ...msg, reactions: newReactions };
            })
        );
    };

    useEffect(() => {
        if (!socket) return;

        socket.on("messageReaction", handleMessageReaction);

        return () => {
            socket.off("messageReaction", handleMessageReaction);
        };
    }, [socket]);



    const handleEmojiSelect = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        //setShowEmojiPicker(false);
        setShowEmojiPicker(true);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target as Node)
            ) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    

    
    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
    //         setOpenOptionsMsgId(null);
    //         }
    //     };
    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                optionsRef.current &&
                !optionsRef.current.contains(event.target as Node) &&
                moreButtonRef.current &&
                !moreButtonRef.current.contains(event.target as Node)
            ) {
                setOpenOptionsMsgId(null); // ẩn menu nếu click ngoài
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



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

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    const handleInput = () => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
        if (!isTypingRef.current) {
            socket.emit('typingStart', {
                receiverEmail: selectedUser?.email
            });
            isTypingRef.current = true;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typingStop', {
                receiverEmail: selectedUser?.email
            });
            isTypingRef.current = false;
        }, 1500);
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

    useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    }, [selectedUser]);

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

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = user.userId || user.id;
    const currentUserEmail = user.email || user.userId;
    // console.log('currentUserEmail:', currentUserEmail);
    
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
                    const timeSent = new Date(sentMsg.createdAt);
                    const key = selectedUser.type === 'friend' ? selectedUser.email : selectedUser.groupId;
                    updateLastMessage(key, sentMsg.content, timeSent, sentMsg.senderEmail);
                    socket.emit("groupMessage", {
                        groupId: selectedUser.groupId,
                        message: {
                            messageId: sentMsg.messageId,
                            content: sentMsg.content,
                            createdAt: sentMsg.createdAt,
                            senderEmail: sentMsg.senderEmail,
                        }
                    });
                    //updateLastMessage(selectedUser.email, sentMsg.content, timeSent);
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
                    updateLastMessage(selectedUser.email, sentMsg.content, timeSent, sentMsg.senderEmail);
                    socket.emit("newMessage", {
                        receiverEmail: selectedUser.email,
                        message: {
                            content: sentMsg.content,
                            createdAt: sentMsg.createdAt,
                            messageId: sentMsg.messageId, 
                            senderEmail: sentMsg.senderEmail,
                        }
                    });
                    setMessage('');
                    scrollToBottom();
                }
            }
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
        }
    };

    useEffect(() => {
        if (socket && selectedUser?.type === 'group' && selectedUser.groupId) {
            socket.emit("joinGroup", { groupId: selectedUser.groupId});
            console.log("📡 Đã join vào nhóm:", selectedUser.groupId);
        }
    }, [socket, selectedUser]);

    useEffect(() => {
        if (!socket) return;

        socket.on("newMessage", (message: any) => {
            console.log('📩Backend received newMessage:', message);
            const { senderEmail, content, createdAt } = message;
            updateLastMessage(senderEmail, content, new Date(createdAt), senderEmail);
            console.log("📩 Nhận tin nhắn đơn từ:", senderEmail);
            console.log("📩 Nội dung:", content);
            const from = message.senderEmail;
            const to = message.receiverEmail; // nếu có

            // Nếu currentUser là người nhận:
            if (from !== currentUserEmail) {
                addUnreadMessage(from); // chính xác hơn
            }
             if (selectedUser?.type === "friend" && selectedUser.email === senderEmail) {
                setChatMessages(prev => [...prev, message]);
            }
        });

        socket.on("newGroupMessage", (data: any) => {
            const { groupId, message } = data;
            console.log("👤 currentUserEmail trong useEffect:", currentUserEmail);
            // Nếu chính mình gửi thì bỏ qua vì đã xử lý ở sendMessage
            if (message.senderEmail === currentUserEmail) return;

            updateLastMessage(groupId, message.content, new Date(message.createdAt), message.senderEmail);
            if (selectedUser?.type === "group" && selectedUser.groupId === groupId) {
                setChatMessages(prev => [...prev, message]); // 👈 cập nhật tin nhắn
            } else {
                addUnreadMessage(groupId); // Nếu đang ở phòng khác
            }
            console.log("📩 Nhận tin nhắn nhóm từ:", message.senderEmail);
            console.log("📩 Nội dung:", message.content);
            
        });

        return () => {
            socket.off("newMessage");
            socket.off("newGroupMessage");
        };
    }, [socket, updateLastMessage, currentUserEmail]);
    
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
                        updateLastMessage(friendEmail, lastMsg.content, new Date(lastMsg.createdAt), lastMsg.senderEmail);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải tin nhắn:", error);
            }
        };
    
        fetchMessages();
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

    // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const token = localStorage.getItem('token');
    //     const file = e.target.files?.[0];
    //     if (!file) return;
    
    //     const formData = new FormData();
    //     formData.append('file', file);
    
    //     try {
    //         const response = await fetch(API_ENDPOINTS.uploadFile, {
    //             method: 'POST',
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //             body: formData
    //         });
    
    //         const result = await response.json();
    
    //         if (result.success) {
    //             console.log('Tải lên thành công:', result.data);
    
                

    //             if (selectedUser.type === 'group') {
    //                 // CHAT NHÓM
    //                 const response = await axios.post<SendGroupMessageResponse>(
    //                     `${API_ENDPOINTS.sendMessageGroup(selectedUser.groupId)}`,
    //                     {
    //                         content: result.data.url,
    //                         type: 'file',
    //                     },
    //                     {
    //                         headers: { Authorization: `Bearer ${token}` }
    //                     }
    //                 );
    //             } else if (selectedUser.type === 'friend') {
    //                 // Gửi tin nhắn chứa đường dẫn file
    //                 await axios.post(API_ENDPOINTS.sendMessage, {
    //                     receiverEmail: selectedUser.email,
    //                     content: result.data.url,
    //                     type: "file"
    //                 }, {
    //                     headers: { Authorization: `Bearer ${token}` }
    //                 });
    //             }

    
    //         } else {
    //             console.error('Lỗi upload:', result.message);
    //         }
    //     } catch (error) {
    //         console.error('Upload failed:', error);
    //     }
    // };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const token = localStorage.getItem('token');
        const file = e.target.files?.[0];
        if (!file || !selectedUser) return;

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
                const fileUrl = result.data.url;
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                const myEmail = user.email;

                if (selectedUser.type === 'group') {
                    const res = await axios.post<SendGroupMessageResponse>(
                        `${API_ENDPOINTS.sendMessageGroup(selectedUser.groupId)}`,
                        {
                            content: fileUrl,
                            type: 'file',
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );

                    if (res.data.success) {
                        const sentMsg = res.data.data;
                        socket.emit("groupMessage", {
                            groupId: selectedUser.groupId,
                            message: {
                                messageId: sentMsg.messageId,
                                content: sentMsg.content,
                                createdAt: sentMsg.createdAt,
                                senderEmail: sentMsg.senderEmail,
                            }
                        });
                        updateLastMessage(selectedUser.groupId, sentMsg.content, new Date(sentMsg.createdAt), myEmail);
                        setChatMessages(prev => [...prev, sentMsg]);
                        scrollToBottom();
                        notification.success({
                            message: 'Tải lên thành công',
                            description: 'Tệp đã được gửi thành công.',
                        });
                    }

                } else if (selectedUser.type === 'friend') {
                    const res = await axios.post<SendMessageResponse>(
                        API_ENDPOINTS.sendMessage,
                        {
                            receiverEmail: selectedUser.email,
                            content: fileUrl,
                            type: "file"
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );

                    if (res.data.success) {
                        const sentMsg = res.data.data;
                        socket.emit("newMessage", {
                            receiverEmail: selectedUser.email,
                            message: {
                                messageId: sentMsg.messageId,
                                content: sentMsg.content,
                                createdAt: sentMsg.createdAt,
                                senderEmail: sentMsg.senderEmail,
                            }
                        });
                        updateLastMessage(selectedUser.email, sentMsg.content, new Date(sentMsg.createdAt), myEmail);
                        setChatMessages(prev => [...prev, sentMsg]);
                        scrollToBottom();
                        notification.success({
                            message: 'Tải lên thành công',
                            description: 'Tệp đã được gửi thành công.',
                        });
                    }
                }
            } else {
                console.error('Lỗi upload:', result.message);
                notification.error({
                    message: 'Tải lên thất bại',
                    description: result.message,
                });
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

    
      
    // const handleRecallMessage = async (messageId?: string) => {
    //     const token = localStorage.getItem('token');
    //     if (!messageId) {
    //         console.warn("messageId bị thiếu khi recall");
    //         return;
    //     }
    //     // console.log("==> recall msg ID:", messageId);
    //     try {
    //         const response = await axios.put(`${API_ENDPOINTS.recall(messageId)}`, null, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         });
    //         const updatedMsg = (response.data as { data: Message }).data;

    //         setChatMessages((prevMessages) =>
    //         prevMessages.map((msg) =>
    //             msg.messageId === updatedMsg.messageId ? updatedMsg : msg
    //         )
    //         );
    //         // console.log("==> Recall response", response.data);
    //     } catch (err: any) {
    //         console.error('Lỗi khi thu hồi tin nhắn:', err.response?.data || err.message);
    //     }
    // };

    const handleRecallMessage = async (
        messageId?: string,
        groupId?: string,
        isGroup: boolean = false
    ) => {
        const token = localStorage.getItem('token');
        if (!messageId) {
            console.warn("messageId bị thiếu khi recall");
            return;
        }

        try {
            const url = isGroup
                ? API_ENDPOINTS.recallGroupMessage(groupId!, messageId)
                : API_ENDPOINTS.recall(messageId);

            const response = await axios.put(url, null, {
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
        setLoading(true);
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
        await axios.post(`${API_ENDPOINTS.addGroupMembers(friend.groupId)}`, 
            { memberIds: selectedFriends },
            { headers: { Authorization: `Bearer ${token}` } }
        );
    
        // Sau khi thêm thành công, cập nhật groupMembers
        setGroupMembers((prev) => [...prev, ...selectedFriends]);

        selectedFriends.forEach((memberId) => {
            socket.emit('addMemberGroup', { groupId: friend.groupId, userId: memberId });
            
        });
    
        // Xóa danh sách selectedFriends sau khi thêm xong
        setSelectedFriends([]);
        fetchGroupMembers(); // Tải lại danh sách thành viên nhóm
        setIsModalOpenGroup(false);
        setIsSidebarOpen(false);
        setShowList(false);
        
        //alert("Thêm thành viên thành công!");
        notification.success({
            message: 'Thêm thành viên thành công!',
        });
      
        } catch (error) {
          console.error("Lỗi khi thêm thành viên:", error);
          notification.error({
            message: 'Có lỗi xảy ra khi thêm thành viên!',
        });
        } finally {
          setLoading(false);
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
        setLoading(true);
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
                notification.success({
                    message: 'Xóa thành viên khỏi nhóm thành công!',
                });
                setIsSidebarOpen(false);
            } else {
                notification.error({
                    message: 'Xóa thành viên thất bại!',
                });
            }
        } catch (error: any) {
            console.error("Lỗi khi xóa thành viên:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Xóa thành viên thất bại!");
        } finally {
            setLoading(false);
        }
    };
    
    const addAdminToGroup = async (groupId: string, adminId: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Chưa đăng nhập");
                return;
            }
    
            const response = await axios.post<ApiResponseAdmin>(
                `${API_ENDPOINTS.addAdminWeb(groupId)}`, 
                { memberId: adminId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (response.data.success) {
                notification.success({
                    message: 'Đã thêm thành viên thành admin!',
                });
                fetchGroupMembers(); 
                // Optionally: Reload group info if you want
            } else {
                notification.error({
                    message: 'Thêm admin thất bại!',
                });
            }
        } catch (error: any) {
            console.error("Lỗi khi thêm admin:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Thêm admin thất bại!");
        } finally {
            setLoading(false);
        }
    };




    const handleRemoveAdmin = async (groupId?: string, adminId?: string) => {
        setLoading(true);
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
                        memberId: adminId, // Gửi memberId qua params
                    },
                }
            );
    
            if (response.data.success) {
                notification.success({
                    message: 'Đã xóa quyền admin của thành viên thành công!',
                });
                // Optional: Cập nhật lại danh sách admin
                fetchGroupMembers(); 
            } else {
                alert(response.data.message || 'Xóa quyền admin thất bại!');
            }
        } catch (error: any) {
            console.error('Lỗi khi xóa admin:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Xóa quyền admin thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const addDeputyToGroup = async (groupId: string, memberId: string) => {
        setLoading(true); 

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Chưa đăng nhập");
                return;
            }

            const response = await axios.post<ApiResponseAdmin>( 
                `${API_ENDPOINTS.addDeputy(groupId)}`, 
                { memberId: memberId }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.data.success) {
                notification.success({
                    message: 'Đã thêm thành viên thành phó trưởng nhóm!',
                });
                fetchGroupMembers(); 
            } else {
                alert('Thêm phó trưởng nhóm thất bại!');
            }
        } catch (error: any) {
            console.error("Lỗi khi thêm phó trưởng nhóm:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Thêm phó trưởng nhóm thất bại!");
        } finally {
            setLoading(false); 
        }
    };

    const handleRemoveDeputy = async (groupId?: string, deputyId?: string) => {
        setLoading(true); 
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Chưa đăng nhập');
                return;
            }
            if (!groupId || !deputyId) {
                console.error('Thiếu thông tin groupId hoặc deputyId');
                return;
            }

            // Gửi yêu cầu DELETE đến API để xóa phó trưởng nhóm
            const response = await axios.delete<ApiResponse>(
                `${API_ENDPOINTS.removeDeputy(groupId)}`, // API endpoint của bạn để xóa phó trưởng nhóm
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        memberId: deputyId, // Gửi memberId (ID của phó trưởng nhóm cần xóa)
                    },
                }
            );

            if (response.data.success) {
                notification.success({
                    message: 'Đã xóa phó trưởng nhóm thành công!',
                });
                // Optional: Cập nhật lại danh sách thành viên nhóm
                fetchGroupMembers(); 
            } else {
                alert(response.data.message || 'Xóa phó trưởng nhóm thất bại!');
            }
        } catch (error: any) {
            console.error('Lỗi khi xóa phó trưởng nhóm:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Xóa phó trưởng nhóm thất bại!');
        } finally {
            setLoading(false); // Đảm bảo rằng loading được tắt khi API đã hoàn thành
        }
    };


    

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
      
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
      
        try {
          const res = await axios.put<UploadAvatarResponse>(`${API_ENDPOINTS.updateGroupInfo(groupId)}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            
          });
            console.log('Avatar updated', res.data);
            fetchGroups(); // Cập nhật lại danh sách nhóm
            setIsModalOpenGroup(false);
            setIsSidebarOpen(false);
            setShowList(false);
          notification.success({
            message: 'Cập nhật ảnh đại diện thành công!',
        });

          // reload group info nếu cần
        } catch (error) {
          console.error('Failed to update avatar', error);
        }
      };

      
    const saveEditedName = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
        const res = await axios.put(`${API_ENDPOINTS.updateGroupInfo(groupId)}`, { name: editedName },{
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Name updated', res.data);
        setSelectedUser((prev: any) => ({ ...prev, name: editedName }));
        setIsEditNameModalOpen(false)
        fetchGroups(); // Cập nhật lại danh sách nhóm
        setIsModalOpenGroup(false);
        setIsSidebarOpen(false);
        setShowList(false);
        notification.success({
            message: 'Cập nhật tên nhóm thành công!',
        });
        // reload group info nếu cần
        } catch (error) {
        console.error('Failed to update name', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserName = async (senderEmail: string) => {
        if (userMap[senderEmail]) return; // đã có thì bỏ qua
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get<UserResponse>(`${API_ENDPOINTS.getProfileByEmail(senderEmail)}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const name = response.data.user.fullName || response.data.user.email;
            const avatar = response.data.user.avatar || 'https://cdn.pixabay.com/photo/2025/03/19/13/20/trees-9480700_1280.jpg'; 
    
            setUserMap(prev => ({ 
                ...prev, 
                [senderEmail]: { name, avatar } 
            }));
        } catch (error) {
            console.error("Lỗi khi lấy tên người gửi:", error);
        }
    };

    useEffect(() => {
        chatMessages.forEach(msg => {
            if (msg.senderEmail && !userMap[msg.senderEmail]) {
                fetchUserName(msg.senderEmail);
            }
        });
    }, [chatMessages]);
    
    const deleteGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete<ApiResponse>(`${API_ENDPOINTS.deleteGroup(groupId)}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          if (res.data.success) {
            fetchGroups(); // Cập nhật lại danh sách nhóm
            // Có thể chuyển hướng hoặc cập nhật lại danh sách nhóm
            notification.success({
                message: 'Xóa nhóm thành công!',
            });

          }
        } catch (error) {
          console.error('Lỗi xóa nhóm:', error);
          alert('Xảy ra lỗi khi xóa nhóm');
        }
    };

    const handleLeaveGroup = async (groupId: string) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
            alert('Vui lòng đăng nhập để thực hiện thao tác này.');
            return;
            }

            const response = await axios.post<ApiResponse>(`${API_ENDPOINTS.leaveGroup(groupId)}`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            if (response.data.success) {
                alert('Bạn đã rời khỏi nhóm thành công!');
                console.log("📤 Emit leaveGroupWeb", { groupId, userEmail: currentUserEmail });
                socket.emit('leaveGroupWeb', { groupId, userEmail: currentUserEmail });
                
                fetchGroups(); // Cập nhật lại danh sách nhóm
                notification.success({
                    message: 'Rời khỏi nhóm thành công!',
                });
            // Cập nhật lại danh sách nhóm hoặc chuyển hướng người dùng
            // Ví dụ: fetchUserGroups();
            } else {
                alert(response.data.message || 'Rời nhóm thất bại!');
            }
        } catch (error: any) {
            console.error('Lỗi khi rời nhóm:', error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Rời nhóm thất bại!');
        } finally {
            setLoading(false);
        }
    };
      
    useEffect(() => {
        socket.on('messageRead', (data: { messageId: string }) => {
            const { messageId } = data;
            setChatMessages(prev =>
                prev.map(msg =>
                    msg.messageId === messageId ? { ...msg, status: 'read' } : msg
                )
            );
        });
    
        return () => {
            socket.off('messageRead');
        };
    }, []);

    useEffect(() => {
        const unreadMessages = chatMessages.filter(
            msg => msg.status !== 'read' && msg.receiverEmail === user.email
        );

        const token = localStorage.getItem('token');
    
        unreadMessages.forEach(msg => {
            fetch(`${API_ENDPOINTS.markAsRead(msg.messageId)}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
        });
    }, [chatMessages]);

    useEffect(() => {
    if (!socket) return;

        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Khi socket reconnect (do reload)
        socket.on('connect', () => {
            if (user?.email) {
                socket.emit('userStatusWeb', {
                    email: user.email,
                    status: 'online'
                });
                console.log("📡 Reconnected - Emit online:", user.email);
            }
        });

        return () => {
            socket.off('connect');
        };
    }, [socket]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (socket?.connected && user?.email) {
            socket.emit('userStatusWeb', {
                email: user.email,
                status: 'online'
            });
            console.log("📡 Socket already connected - Emit online:", user.email);
        }
    }, [socket]);


    useEffect(() => {
        if (!socket) return;

        socket.on('friendStatusUpdateWeb', (data: { email: string; online: boolean }) => {
            const { email, online } = data;
            setFriendStatuses(prev => ({
                ...prev,
                [email.toLowerCase().trim()]: online
            }));
        });

        // ✅ Nhận danh sách bạn bè online ban đầu
        socket.on('initialFriendStatusesWeb', (data: { friends: string[]; onlineFriends: string[] }) => {
            const { friends, onlineFriends } = data;
            const newStatuses: Record<string, boolean> = {};
            friends.forEach(friend => {
                newStatuses[friend.toLowerCase().trim()] = onlineFriends.includes(friend);
            });
            setFriendStatuses(newStatuses);
        });

        return () => {
            socket.off('friendStatusUpdateWeb');
            socket.off('initialFriendStatusesWeb');
        };
    }, [socket]);

    useEffect(() => {
        console.log("Friend statuses:", friendStatuses);  // In ra friendStatuses khi thay đổi
    }, [friendStatuses]);

    useEffect(() => {
        socket.on('typingStart', (data: { senderEmail: string }) => {
            if (data.senderEmail === selectedUser?.email) {
                setIsTyping(true);
                setTypingUser(data.senderEmail);
                console.log("Người đang nhập:", data.senderEmail);
            }
        });

        socket.on('typingStop', (data: { senderEmail: string }) => {
            if (data.senderEmail === selectedUser?.email) {
                setIsTyping(false);
                setTypingUser(null);
                console.log("Người đã ngừng nhập:", data.senderEmail);
            }
        });

        return () => {
            socket.off('typingStart');
            socket.off('typingStop');
        };
    }, [selectedUser]);


    useEffect(() => {
        if (!groupId) return;

        const handleGroupMessage = (msg: any) => {
            console.log('🔥 groupID:', groupId);
            console.log('🔥 Nhận được groupMessageLeave:', msg);

            if (msg.groupId === groupId && msg.type === 'system') {
                setChatMessages(prev => {
                const updated = [...prev, { ...msg, isSystem: true, messageId: `system-${Date.now()}-${Math.random()}` }];
                console.log('✅ Chat messages sau khi thêm system message:', updated);
                return updated;
                });
            }
            console.log('🔥 Sau khi dùng hàm:', msg);
        };

        

        socket.on('groupMessageLeave', handleGroupMessage);

        return () => {
            socket.off('groupMessageLeave', handleGroupMessage);
        };
    }, [groupId]);

    useEffect(() => {
        if (!groupId) return;
        const handleJoinMessage = (msg: any) => {
            if (msg.groupId === groupId && msg.type === 'system') {
                setChatMessages(prev => [
                    ...prev,
                    {
                        ...msg,
                        isSystem: true,
                        messageId: `system-${Date.now()}-${Math.random()}`
                    }
                ]);
            }
        };
        socket.on('groupMessageJoin', handleJoinMessage);
        return () => {
            socket.off('groupMessageJoin', handleJoinMessage);
        };
    }, [groupId]);

    const toggleMemberInvite = async (groupId: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post<ApiResponse>(
                API_ENDPOINTS.toggleMemberInvite(groupId),
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setGroupMembers(response.data.data); // cập nhật lại group
                setAllowMemberInvite(response.data.data.allowMemberInvite);
                notification.success({
                    message: 'Cập nhật quyền mời thành viên thành công!',
                });
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || "Lỗi khi cập nhật quyền mời thành viên";
            notification.error({ message });
        }
    };

    const handleForwardMessage = async (
        messageId: string,
        sourceGroupId: string,
        targetGroupId?: string,
        targetEmail?: string
        ) => {
        if (!messageId || !sourceGroupId) {
            console.warn("Thiếu messageId hoặc sourceGroupId");
            return;
        }

        if (!targetGroupId && !targetEmail) {
            console.warn("Phải cung cấp targetGroupId hoặc targetEmail");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("Không tìm thấy token");
            return;
        }

        try {
            const url = API_ENDPOINTS.forwardMessageGroup(sourceGroupId, messageId);
            

            const body = {
            ...(targetGroupId && { targetGroupId }),
            ...(targetEmail && { targetEmail }),
            };

            const response = await axios.post<ApiResponse>(url, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
            });

            const forwardedMsg = response.data.data;

            // Cập nhật giao diện: thêm tin nhắn mới nếu muốn
            setChatMessages((prev) => [...prev, forwardedMsg]);

            if (response.data.success) {
                setGroupMembers(response.data.data); // cập nhật lại group
                setAllowMemberInvite(response.data.data.allowMemberInvite);
                notification.success({
                    message: "Chuyển tiếp tin nhắn thành công!",
                });
            }
            setShowForwardModal(false);
        } catch (error: any) {
            console.error("Lỗi khi chuyển tiếp tin nhắn:", error.response?.data || error.message);
            notification.error({
                message: "Không chuyển tiếp tin nhắn được!",
            });
        } 
    };

    const onConfirmForward = () => {
        if (!selectedMsg) {
            notification.error({ message: "Chưa chọn tin nhắn để chuyển tiếp" });
            return;
        }
        if (!forwardTarget) {
            notification.error({ message: "Chưa chọn người nhận" });
            return;
        }

        // Tách prefix group- hoặc user-
        if (forwardTarget.startsWith("group-")) {
            const targetGroupId = forwardTarget.replace("group-", "");
            handleForwardMessage(selectedMsg.messageId, selectedMsg.groupId!, targetGroupId, undefined);
        } else if (forwardTarget.startsWith("user-")) {
            const targetEmail = forwardTarget.replace("user-", "");
            handleForwardMessage(selectedMsg.messageId, undefined!, undefined, targetEmail);
        }

        setShowForwardModal(false);
    };


    

    if (loading) {
      return (
        <div className='spinnerContainer'>
          <div className='spinner'></div>
          <p>Vui lòng đợi trong giây lát...</p>
        </div>
      );
    }

    return (
        <div className="home-container">
            <div className="right-section">
                {selectedUser ? (
                    <div className={`body-chat ${isSidebarOpen ? "shrink" : ""}`}>
                        <div className="header-chat">
                            <div className="info-chat">
                                <div className="avatar-icon" onClick={selectedUser.type === "friend" ? () => handleUserClick(selectedUser) : undefined}>
                                    <img
                                        src={selectedUser.avatar || "https://cdn.pixabay.com/photo/2025/03/18/17/03/dog-9478487_1280.jpg"}
                                        alt={selectedUser.type === "friend" ? selectedUser.fullName : selectedUser.name}
                                    />
                                </div>
                                <div className="title-chat">
                                    <span className="title-name">
                                        {selectedUser.type === "friend" ? selectedUser.fullName : selectedUser.name}
                                    </span>
                                    <span className="title-status">
                                        {selectedUser.type === 'friend' && selectedUser.email && (
                                            <span
                                                className={
                                                    friendStatuses[selectedUser.email.toLowerCase().trim()]
                                                        ? 'status-online'
                                                        : 'status-offline'
                                                }
                                            >
                                                {friendStatuses[selectedUser.email.toLowerCase().trim()] ? 'Đang hoạt động' : 'Không hoạt động'}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="icon-section-chat">
                                {/* <UsergroupAddOutlined className="icon-addgroup"/> */}
                                <VideoCameraOutlined className="icon-videochat"/>
                                <MenuFoldOutlined className="icon-menufold" onClick={() => {
                                    setIsSidebarOpen(!isSidebarOpen);
                                    closeListMember();
                                    fetchGroupMembers();
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

                                //console.log("msg", msg);
                                if (msg.isSystem) {
                                    return (
                                        <div key={msg.messageId} className="message-item-chat system-chat">
                                            <div className="system-message">
                                                {/* {userMap[msg.content] ? (
                                                    <> */}
                                                        <strong>{msg.content}</strong>{" "}
                                                        {msg.action === 'join' ? "đã được thêm vào nhóm."  : "đã rời khỏi nhóm."}
                                                    {/* </>
                                                ) : (
                                                msg.content // Nếu chưa có tên hiển thị email
                                                )} */}
                                            </div>
                                        </div>
                                    );
                                }

                                
                                return (
                                    <div
                                        key={msg.messageId}
                                        className={`message-item-chat ${messageClass}`}
                                       
                                        onMouseLeave={() => {
                                            hideOptionsTimeout.current = setTimeout(() => {
                                                setHoveredMsgId(null);
                                                setOpenOptionsMsgId(null);
                                            }, 500); // 5 giây
                                        }}
                                        onMouseEnter={() => {
                                            if (hideOptionsTimeout.current) {
                                                clearTimeout(hideOptionsTimeout.current);
                                                hideOptionsTimeout.current = null;
                                            }
                                            setHoveredMsgId(msg.messageId);
                                        }}
                                        // onMouseLeave={() => setHoveredMsgId(null)}
                                        // onMouseEnter={() => setHoveredMsgId(msg.messageId)}
                                    >
                                    <div className="message-content">
                                         {/* Nếu là group và không phải tin nhắn của mình thì hiển thị tên */}
                                        {isGroupChat && !isOwnMessage && (
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#555' }}>
                                            {/* {msg.senderEmail} */}
                                                {userMap[msg.senderEmail] ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-16px' }}>
                                                        <img src={userMap[msg.senderEmail].avatar} alt="Avatar" className="avt-user-group-mess" />
                                                        {userMap[msg.senderEmail].name}
                                                    </div>
                                                ) : (
                                                    msg.senderEmail // Nếu chưa có tên/ avatar, hiển thị email
                                                )}
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
                                        ) : isVideo ? (
                                            <video
                                                src={msg.content}
                                                controls
                                                style={{ maxWidth: '300px', borderRadius: 8 }}
                                            >
                                                Trình duyệt của bạn không hỗ trợ video.
                                            </video>
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

                                        {hoveredMsgId === msg.messageId && (
                                            <div className="reaction-box" style={{ display: 'flex', gap: '4px', marginTop: 4 }}>
                                                {reactionsList.map((icon) => (
                                                    <span
                                                        key={icon}
                                                        style={{ cursor: 'pointer', fontSize: '18px' }}
                                                        onClick={() => handleReactMessage(msg.messageId, icon)}
                                                    >
                                                        {icon}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {/* {msg.reactions && msg.reactions.length > 0 && (
                                            <div style={{ fontSize: '14px', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {msg.reactions.map((r, idx) => (
                                                    <span key={idx} style={{ background: '#eee', padding: '2px 6px', borderRadius: '12px' }}>
                                                        {r.reaction} {r.senderEmail === user.email ? '(Bạn)' : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )} */}
                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div
                                                style={{
                                                fontSize: '14px',
                                                marginTop: '4px',
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '4px',
                                                }}
                                            >
                                                {msg.reactions.map((r, idx) => {
                                                const displayName =
                                                    r.senderEmail === user.email
                                                    ? 'Bạn'
                                                    : userMap[r.senderEmail]?.name || r.senderEmail;

                                                return (
                                                    <span
                                                    key={idx}
                                                    style={{
                                                        background: '#eee',
                                                        padding: '2px 6px',
                                                        borderRadius: '12px',
                                                        cursor: 'default',
                                                    }}
                                                    title={displayName} // 👈 Tên chỉ hiển thị khi hover vào
                                                    >
                                                    {r.reaction}
                                                    </span>
                                                );
                                                })}
                                            </div>
                                        )}
                                        {hoveredMsgId === msg.messageId && (
                                            <div
                                                className="message-options"
                                                ref={moreButtonRef}
                                                style={{
                                                    position: 'absolute',
                                                    [isOwnMessage ? 'left' : 'right']: -30,
                                                    top: 0,
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    setSelectedMsg(msg);
                                                    //setShowModal(true);
                                                    //setShowOptions((prev) => !prev);
                                                
                                                    setOpenOptionsMsgId(prev => (prev === msg.messageId ? null : msg.messageId));
                                                    // console.log("Clicked more options");
                                                }}
                                            >
                                                <MoreOutlined />
                                            </div>
                                        )}

                                        {openOptionsMsgId === msg.messageId && (
                                            <div
                                            ref={optionsRef}
                                            className="message-options-menu"
                                            style={{
                                                position: 'absolute',
                                                top: '35px',
                                                [isOwnMessage ? 'left' : 'right']: -130,
                                                backgroundColor: '#fff',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                zIndex: 1000,
                                            }}
                                            >
                                                <div
                                                    className="message-option"
                                                    style={{ padding: '8px', cursor: 'pointer' }}
                                                    onClick={() => handleDeleteMessage(msg.messageId)}
                                                >
                                                    Xóa chỉ ở phía tôi
                                                </div>
                                                 {selectedMsg && canRecallMessage(selectedMsg.createdAt) && isOwnMessage && !msg.isRecalled && (
                                                    <div
                                                        className="message-option"
                                                        style={{ padding: '8px', cursor: 'pointer', color: 'red' }}
                                                        onClick={() => handleRecallMessage(selectedMsg?.messageId, groupId, selectedUser.type === 'group')}
                                                    >
                                                        Thu hồi tin nhắn
                                                    </div>
                                                 )}
                                                 <div
                                                    className="message-option"
                                                    style={{ padding: '8px', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setSelectedMsg(msg);
                                                        setShowForwardModal(true);
                                                        setOpenOptionsMsgId(null);
                                                    }}
                                                    >
                                                    Chuyển tiếp
                                                </div>
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
                                                        handleRecallMessage(selectedMsg?.messageId, groupId); // truyền groupId nếu có
                                                        setShowModal(false);
                                                    }}
                                                        block
                                                    >
                                                        Thu hồi tin nhắn
                                                    </Button>
                                                )}
                                            </Modal>

                                            
                                    </div>
                                    {isOwnMessage && !msg.groupId && (
                                        <div style={{ fontSize: '11px', color: msg.status === 'read' ? '#151515' : '#a6a6a6' }}>
                                            {msg.status === 'read' ? 'Đã xem' : 'Đã gửi'}
                                        </div>
                                    )}
                                        <div className="message-time">{timeAgo(msg.createdAt)}</div>
                                    </div>
                                    
                                );
                                
                            })}
                            {showScrollToBottom && (
                                <div
                                    className="scroll-to-bottom"
                                    onClick={scrollToBottomAll}
                                >
                                    <DownOutlined className="icon-scroll"/>
                                </div>
                            )}
                            <div ref={bottomRef} />
                            {isTyping && selectedUser?.email === typingUser && (
                                <div className="typing-indicator">
                                    <div className="message-content" style={{ fontStyle: 'italic', color: '#888' }}>
                                        Đang soạn tin nhắn...
                                    </div>
                                </div>
                            )}
                            
                        </div>
                        
                        <div className="footer-chat">
                            <div className="menu-section-chat">
                                <FontAwesomeIcon 
                                    icon={faLaughBeam} 
                                    
                                    onClick={() => setShowEmojiPicker(prev => !prev)}
                                    style={{ cursor: 'pointer' }}
                                />
                                {showEmojiPicker && (
                                    <div
                                        ref={emojiPickerRef}
                                        onMouseEnter={() => setIsHoveringEmojiPicker(true)}
                                        onMouseLeave={() => setIsHoveringEmojiPicker(false)}
                                        style={{
                                            position: 'absolute',
                                            bottom: '126px', // hiển thị phía trên icon
                                            left: '475px',
                                            zIndex: 1000
                                        }}
                                    >
                                        <EmojiPicker
                                            onEmojiClick={(emojiData) => handleEmojiSelect(emojiData.emoji)}
                                        />
                                    </div>
                                )}
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
                                    {/* <FontAwesomeIcon icon={faLaughBeam} /> */}
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
                                    {/* Icon edit avatar */}
                                    {selectedUser.type === "group" && (selectedUser.admins?.includes(currentUserId) || selectedUser.deputies?.includes(currentUserId)) && (
                                        <>
                                        <CameraFilled 
                                            className="icon-edit-avatar"
                                            onClick={() => {
                                            if (selectedUser.type === "group") {
                                                document.getElementById('avatar-upload')?.click();
                                            }
                                            }}
                                        />
                                        <input 
                                            id="avatar-upload" 
                                            type="file" 
                                            accept="image/*" 
                                            style={{ display: 'none' }} 
                                            onChange={handleAvatarChange} 
                                        />
                                        </>
                                    )}
                                </div>
                                <div className="name-user">
                                        <p className="name-user">{selectedUser.type === "friend" ? selectedUser.fullName : selectedUser.name}</p>
                                    {/* Icon edit name */}
                                    {selectedUser.type === "group" && (selectedUser.admins?.includes(currentUserId) || selectedUser.deputies?.includes(currentUserId)) && (
                                        <EditOutlined
                                            className="icon-edit"
                                            onClick={() => {
                                                setIsEditNameModalOpen(true);   
                                                setEditedName(selectedUser.name);
                                            }}
                                            style={{ marginLeft: 8, cursor: 'pointer' }}
                                        />
                                    )}
                                </div>
                                
                                <Modal
                                    open={isEditNameModalOpen}
                                    onCancel={() => setIsEditNameModalOpen(false)}
                                    onOk={saveEditedName}
                                    title="Chỉnh sửa tên nhóm"
                                    okText="Xác nhận"
                                    cancelText="Hủy"
                                >
                                    <Input
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        onPressEnter={saveEditedName}
                                    />
                                </Modal>

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
                                        <div className="btn-addgroup" onClick={showModalGroup}>
                                            <UsergroupAddOutlined className="icon-usegroup"/>
                                            <p className="text-icon">Thêm thành viên</p>
                                        </div>
                                        
                                        {selectedUser.admins?.includes(currentUserId)&& (
                                            <div className="btn-addgroup" onClick={deleteGroup}>
                                            <DeleteOutlined className="icon-pin"/>
                                            <p className="text-icon">Xóa nhóm</p>
                                        </div>
                                        )}
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
                            {[...members]
                                .sort((a, b) => (b.role === 'admin' ? 1 : 0) - (a.role === 'admin' ? 1 : 0))
                                .map(member => (
                                <div 
                                    key={member.userId} 
                                    className="item-mem" 
                                    onMouseEnter={() => setOpenMenuUserId(member.userId)}
                                    onMouseLeave={() => setOpenMenuUserId(null)}
                                    style={{ position: "relative" }}
                                >
                                    <div className="avatar-mem">
                                        <img src={member.avatar} alt="" />
                                        {member.role === 'admin' && (
                                            <FontAwesomeIcon icon={faKey} />
                                        )}
                                        
                                    </div>
                                    <div className="name-mem">
                                        <p>{member.fullName}</p>
                                        <span>
                                            {member.role === 'admin' ? 'Trưởng nhóm' :
                                            member.role === 'deputy' ? 'Phó trưởng nhóm' :
                                            'Thành viên'}
                                        </span>
                                        
                                    </div>
                                    {openMenuUserId === member.userId && (
                                        // Nếu mình là admin hoặc phó nhóm => thấy menu của mọi người
                                        selectedUser.admins?.includes(currentUserId) ||
                                        selectedUser.deputies?.includes(currentUserId) ||
                                        // Nếu mình là member thường => chỉ thấy menu của chính mình
                                        member.userId === currentUserId
                                    ) && (
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
                                            {member.userId !== currentUserId && member.role !== 'admin' && member.role != 'deputy' && (
                                                <>
                                                    <div className="menu-item" onClick={() => addAdminToGroup(groupId, member.userId)}>Làm admin</div>
                                                    <div className="menu-item" onClick={() => addDeputyToGroup(groupId, member.userId)}>Làm phó nhóm</div>
                                                </>
                                            )}
                                            {member.role == 'deputy' && (
                                                <>
                                                    <div className="menu-item" onClick={() => handleRemoveDeputy(groupId, member.userId)}>Xóa phó nhóm</div>
                                                </>
                                            )}
                                            {/* Nếu là admin thì hiển thị nút "Xóa quyền admin" */}
                                            {member.userId !== currentUserId && member.role == 'admin' && (
                                                <div className="menu-item" onClick={() => handleRemoveAdmin(groupId, member.userId)}>Xóa quyền admin</div>
                                            )}

                                            {/* Nút "Xóa thành viên" luôn hiển thị */}
                                            {member.userId !== currentUserId && (
                                                <>
                                                    <div className="menu-item" onClick={() => handleRemoveMember(groupId, member.userId)}>Xóa thành viên</div>
                                                </>
                                            )}
                                            {member.userId == currentUserId && (
                                                <div className="menu-item" onClick={() => handleLeaveGroup(groupId)}>
                                                    Rời nhóm
                                                </div>
                                            )}
                                            {selectedUser.admins?.includes(currentUserId) && (
                                                <div className="menu-item" onClick={() => toggleMemberInvite(groupId)}>
                                                    {allowMemberInvite ? 'Tắt quyền mời thành viên' : 'Bật quyền mời thành viên'}
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

                {/* modal hiển thị thông tin người dùng */}
                {selectedUser && (
                    <Modal 
                        open={isModalOpenUser} 
                        onClose={handleCloseModal} 
                        className="user-modal"
                        footer={null} 
                        closable={false} 
                    >
                        <div className="modal-content">
                            <div className="title-modal">
                                <p>Thông tin tài khoản</p>
                                <CloseOutlined className="icon-close-modal-user" onClick={handleCloseModal}/>
                            </div>
                            <div className="cover-img">
                                <img src={selectedUser.avatar} alt="Cover Image" className="cover-img" />
                            </div>
                            <div className="info-modal">
                                <div className="name-info">
                                    <img src={selectedUser.avatar} alt='Avatar' className='avt-img'/>
                                    <div className="name-setting">
                                        <p>{selectedUser.fullName}</p>
                                        <FontAwesomeIcon icon={faPencil} />
                                    </div>
                                </div>
                                <div className="btn-info">
                                    <button className="btn-addfriend">Hủy kết bạn</button>
                                    <button className="btn-chat">Nhắn tin</button>
                                </div>
                            </div>
                            <div className="info-detail">
                                <p className='info-detail-title'>Thông tin cá nhân</p>
                                <div className="info-detail-item">
                                    <p>Email</p>
                                    <span>{selectedUser.email}</span>
                                </div>
                                <div className="info-detail-item">
                                    <p>Số điện thoại</p>
                                    <span>{selectedUser.phoneNumber}</span>
                                </div>
                            </div>
                            <div className="btn-modal-other"></div>
                        </div>
                    </Modal>
                )}

                <Modal
                    open={showForwardModal}
                    onCancel={() => setShowForwardModal(false)}
                    onOk={onConfirmForward}
                    title="Chuyển tiếp tin nhắn"
                    >
                    <div>
                        <label>Chọn người nhận:</label>
                        <Select
                        style={{ width: '100%' }}
                        placeholder="Chọn nhóm hoặc bạn bè"
                        onChange={(value) => setForwardTarget(value)}
                        options={[
                            ...groups.map(group => ({
                                label: group.name,
                                value: `group-${group.groupId}`
                            })),
                            ...friends.map(friend => ({
                                label: friend.fullName,
                                value: `user-${friend.email}`
                            }))
                        ]}
                        />
                    </div>
                </Modal>

            </div>
        </div>
    );
};

export default Home;