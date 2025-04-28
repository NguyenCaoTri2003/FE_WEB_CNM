import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../assets/styles/Navbar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faContactBook, faTools, faCloud, faSearch, faPencil, faPen } from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from '../config/api';
import { UserOutlined, SettingOutlined, GlobalOutlined, QuestionCircleOutlined, UserSwitchOutlined, UsergroupAddOutlined, CameraOutlined ,UserAddOutlined, CloseOutlined, EllipsisOutlined, MoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { useMessageContext } from "../context/MessagesContext";

// Định nghĩa interface cho dữ liệu user
interface UserProfile {
  fullName: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
}

interface SearchUserResponse {
  success: boolean;
  data: {
      fullName: string;
      avatar: string;
      phoneNumber: string;
      email: string;
  };
}

interface FriendRequestResponse {
    success: boolean;
    message: string;
  }
  

Modal.setAppElement("#root");

interface Message {
    id: number;
    name: string;
    message: string;
    time: string;
}

interface Friend {
    userId: string;
    email: string;
    fullName: string;
    avatar: string; // optional
}

interface Group {
  email: string;
  groupId: string;
  name: string;
  avatar: string; 
}

interface FriendResponse {
    success: boolean;
    data: Friend[];
}

interface GroupResponse {
  success: boolean;
  data: Group[];
  message?: string;
}

interface CreateGroupResponse {
  success: boolean;
  message?: string;
}

type CombinedItem = 
  | (Friend & { type: "friend" })
  | (Group & { type: "group" });

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
    const [selectedUserSearch, setSelectedUserSearch] = useState<any>(null);
    const [isModalOpenUser, setIsModalOpenUser] = useState(false);
    const [isModalOpenGroup, setIsModalOpenGroup] = useState(false);

    // const [selectedUser, setSelectedUser] = useState<Message | null>(null);
    // const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
    // const [isModalOpen, setIsModalOpen] = useState(false);
    // const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const [hoveredMessageType, setHoveredMessageType] = useState<"friend" | "group" | null>(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    
    const [isSearching, setIsSearching] = useState(false);
    const [showContacts, setShowContacts] = useState(false);

    const [hasSentRequest, setHasSentRequest] = useState<boolean>(false);

    const [friends, setFriends] = useState<Friend[]>([]);
    const [groups, setGroups] = useState<Group[]>([]); 

    const { lastMessages, updateLastMessage } = useMessageContext()!;
    // const displayLastMessageTime = lastMessageTime ? lastMessageTime.toString().slice(0, 10) : 'Chưa có tin nhắn';
    const [storedMessage, setStoredMessage] = useState<{ message: string, time: Date } | null>(null);

    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

    //tìm kiếm bạn bè
    const [searchFriendTerm, setSearchFriendTerm] = useState('');
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>(friends); 

    //thêm nhóm
    const [groupNameInput, setGroupNameInput] = useState('');

    const [selectedItem, setSelectedItem] = useState<any>(null);


    // console.log("LastMessages context:", lastMessages);

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

    // const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    //   if (e.key === 'Enter' && searchTerm.trim()) {
    //       try {
    //           const response = await axios.get<SearchUserResponse>(API_ENDPOINTS.search, {
    //               params: {
    //                   email: searchTerm.trim()
    //               }
    //           });

    //           if (response.data?.data) {
    //               const newUser = response.data.data;
    //               const alreadyExists = searchedUsers.some(u => u.email === newUser.email);
    //               if (!alreadyExists) {
    //                   setSearchedUsers(prev => [newUser, ...prev]);
    //               }
    //               setSearchTerm('');
    //           }
    //       } catch (err) {
    //           console.error("Tìm không thấy người dùng hoặc lỗi server", err);
    //       }
    //   }
    // };

    // const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    //   if (e.key === 'Enter' && searchTerm.trim()) {
    //       setIsSearching(true); // 👉 bật chế độ tìm kiếm
    //       try {
    //           const response = await axios.get<SearchUserResponse>(API_ENDPOINTS.search, {
    //               params: { email: searchTerm.trim() }
    //           });
    
    //           if (response.data?.data) {
    //               const newUser = response.data.data;
    //               const alreadyExists = searchedUsers.some(u => u.email === newUser.email);
    //               if (!alreadyExists) {
    //                   setSearchedUsers(prev => [newUser, ...prev]);
    //               }
    //               setSearchTerm('');
    //           }
    //       } catch (err) {
    //           console.error("Tìm không thấy người dùng hoặc lỗi server", err);
    //       }
    //   }
    // };
    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
          setIsSearching(true);
          try {
            const response = await axios.get<SearchUserResponse>(API_ENDPOINTS.search, {
              params: { email: searchTerm.trim(), phoneNumber: searchTerm.trim() } 
            });
      
            if (response.data?.data) {
              const newUser = {
                ...response.data.data,
                searchedAt: new Date().toISOString() // 👉 Lưu thời gian tìm kiếm
            };

            if (
                (user?.email && user.email === newUser.email) ||
                (user?.phoneNumber && user.phoneNumber === newUser.phoneNumber)
              ) {
                navigate('/profile');
                return; // Dừng không xử lý tiếp
              }
      
            const existing = JSON.parse(localStorage.getItem("searchedUsers") || "[]");
            const alreadyExists = existing.some((u: any) => u.email === newUser.email);
            const updated = alreadyExists ? existing : [newUser, ...existing];
      
            localStorage.setItem("searchedUsers", JSON.stringify(updated));
            setSearchedUsers(updated);
            setSearchTerm('');
        }
          } catch (err) {
            console.error("Tìm không thấy người dùng hoặc lỗi server", err);
          }
        }
    };

    useEffect(() => {
        if (isSearching) {
          const stored = JSON.parse(localStorage.getItem("searchedUsers") || "[]");
      
          const fiveDaysAgo = new Date();
          fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
          const filtered = stored.filter((user: any) => {
            return new Date(user.searchedAt) >= fiveDaysAgo;
          });
      
          setSearchedUsers(filtered);
        }
      }, [isSearching]);
      
      

    const handleUserClick = (user: any) => {
        setSelectedUserSearch(user);
        setIsModalOpenUser(true);
    };

    const handleCloseModal = () => {
        setIsModalOpenUser(false);
    };

    const handleCloseModalGroup = () => {
        setIsModalOpenGroup(false);
    };

    const handleOpenGroup = () => {
        setIsModalOpenGroup(true);
    };

    // const handleRemoveUser = (email: string) => {
    //     setSearchedUsers(prev => prev.filter(user => user.email !== email));
    // };
    const handleRemoveUser = (email: string) => {
        setSearchedUsers(prev => {
          const updated = prev.filter(user => user.email !== email);
          localStorage.setItem("searchedUsers", JSON.stringify(updated));
          return updated;
        });
      };

    // Gửi lời mời kết bạn
    const sendFriendRequest = async (receiverEmail: string) => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            console.log("Token không tồn tại, người dùng chưa đăng nhập");
            return;
          }
      
          const response = await axios.post<FriendRequestResponse>(
            API_ENDPOINTS.sendFriendRequest,
            { receiverEmail },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
      
          if (response.data.success) {
            console.log("Đã gửi lời mời kết bạn");
            setHasSentRequest(true);
          } else {
            console.log(response.data.message);
          }
        } catch (err) {
          console.error(err);
          console.log("Lỗi khi gửi lời mời");
        }
      };

    const cancelFriendRequest = async (receiverEmail: string) => {
        try {
          const response = await axios.post<FriendRequestResponse>(API_ENDPOINTS.withdrawFriendRequest, {
            receiverEmail
          });
      
          if (response.data.success) {
            console.log("Đã thu hồi lời mời");
            setHasSentRequest(false);
          } else {
            console.log(response.data.message);
          }
        } catch (err) {
          console.error(err);
          console.log("Lỗi khi thu hồi lời mời");
        }
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

        const fetchGroups = async () => {
          try {
            const token = localStorage.getItem('token'); // Lấy token từ localStorage
            const response = await axios.get<GroupResponse>(API_ENDPOINTS.getGroups, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
    
            if (response.data.success) {
              setGroups(response.data.data); // Cập nhật state nhóm
            } else {
              console.error('Error fetching groups:', response.data.message);
            }
          } catch (error) {
            console.error('Error fetching groups:', error);
          } finally {
            // setLoading(false);
          }
        };
        
    
        fetchGroups();
    }, []);

    type CombinedItem = 
    | (Friend & { type: "friend" })
    | (Group & { type: "group" });

      const combinedList: CombinedItem[] = [
        ...friends.map(friend => ({ ...friend, type: "friend" as const })),
        ...groups.map(group => ({ ...group, type: "group" as const }))
      ];

      
    useEffect(() => {
        // Lấy tin nhắn cuối từ localStorage khi component mount
        const stored = localStorage.getItem('lastMessage');
        if (stored) {
            setStoredMessage(JSON.parse(stored));
        }
    }, []);

    const handleSearchFriend = () => {
      const searchText = searchFriendTerm.trim().toLowerCase();
      if (searchText === '') {
        setFilteredFriends(friends);
      } else {
        const filtered = friends.filter(friend =>
          friend.fullName.toLowerCase().includes(searchText)
        );
        setFilteredFriends(filtered);
      }
    };
    
    const handleClearSearch = () => {
      setSearchFriendTerm('');
      setFilteredFriends(friends);
    };

  useEffect(() => {
      setFilteredFriends(friends);
  }, [friends]);

  const handleCreateGroup = async () => {
    const token = localStorage.getItem('token'); 
    if (selectedFriends.length < 2) {
      alert('Bạn phải chọn ít nhất 2 thành viên để tạo nhóm.');
      return;
    }
  
    let groupName = groupNameInput.trim();
    
    if (!groupName) {
      // Nếu không nhập tên nhóm, ghép tên các thành viên
      const selectedUsers = friends.filter(friend => selectedFriends.includes(friend.email));
      groupName = selectedUsers.map(user => user.fullName).join(', ');
    }
  
    const groupData = {
      name: groupName,
      description: '', // Bạn có thể cho nhập description nếu cần
      members: selectedFriends, // Mảng email các thành viên được chọn
      avatar: '', // Hoặc bạn cho upload hình avatar riêng, không thì để BE default
    };
  
    try {
      const response = await axios.post<CreateGroupResponse>(
        API_ENDPOINTS.createGroup,
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        alert('Tạo nhóm thành công!');
        handleCloseModalGroup(); // Đóng modal
        // fetchGroups();
        // Bạn có thể thêm: load lại danh sách nhóm nếu muốn
      } else {
        alert('Tạo nhóm thất bại: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Có lỗi khi tạo nhóm.');
    }
  };
  
    

  return (
    <div className="container-main">
      <div className="container-navbar">
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
                <FontAwesomeIcon icon={faComments} onClick={() => setShowContacts(false)}/>
              </div>
            </Link>
              <div className="icon-contact">
                <FontAwesomeIcon icon={faContactBook} onClick={() => setShowContacts(true)}/>
              </div>
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

      <div className="container-search">
            <div className="search-section">
                <div className="search-input">
                    <FontAwesomeIcon icon={faSearch} />
                    <input 
                        type="text"
                        placeholder="Tìm kiếm" 
                        value={searchTerm}
                        // onChange={(e) => setSearchTerm(e.target.value)}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          if (e.target.value === '') setIsSearching(false); 
                        }}
                        onFocus={() => setIsSearching(true)}
                        onKeyDown={handleSearch}
                    />
                </div>
                <div className="icon-section">
                    {isSearching ? (
                        <button className="close-button" onClick={() => {
                            setIsSearching(false);
                            setSearchTerm('');
                            setSearchedUsers([]);
                        }}>
                            Đóng
                        </button>
                    ) : (
                        <>
                            {/* <UserAddOutlined className="icon-adduser" /> */}
                            <UsergroupAddOutlined className="icon-addgroup" onClick={handleOpenGroup}/>
                        </>
                    )}
                </div>         
            </div>

            {isSearching ? (
                searchedUsers.length > 0 ? (
                    <div className="user-search">
                        <div className="title-search">
                            <p>Tìm gần đây</p>
                        </div>
                        <div className="list-search">
                            {searchedUsers.map((user) => (
                                <div key={user.email} className="user-item" onClick={() => handleUserClick(user)}>
                                    <div className="info-user">
                                        <img src={user.avatar} alt="User" />
                                        <div className="user-name">{user.fullName}</div>
                                    </div>
                                    <CloseOutlined className="icon-close" onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveUser(user.email);
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="user-search">
                        <p>Không tìm thấy người dùng nào.</p>
                    </div>
                )
            ) : (
                <div className="left-section">
                    
                    {!showContacts ? (
                        <div className="user-chat-section">
                            <div className="category-menu">
                                <div className="btn-section">
                                    <button className="btn-prioritize active">Ưu tiên</button>
                                    <button className="btn-other">Khác</button>
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
                                {combinedList.map((item) => {
                                    const id = item.type === "friend" ? item.email : item.groupId;
                                    const last = lastMessages[id];
                                    const isImage = last?.message?.startsWith("http") && /\.(jpg|jpeg|png|gif)$/i.test(last.message);
                                    const isFile = last?.message?.startsWith("http") && !isImage;
                                    // const isRecall = last?.message === undefined;

                                    const messageLabel = isImage
                                        ? "🖼️ Hình ảnh"
                                        : isFile
                                        ? "📎 Tệp tin"
                                        // : isRecall
                                        // ? "Tin nhắn đã được thu hồi"
                                        : last?.message || "Chưa có tin nhắn";
                                        

                                    const displayTime = last?.time
                                        ? new Date(last.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : "";
                                    
                                    

                                    return (
                                        <div 
                                            key={item.email} 
                                            className={`message-item ${
                                              selectedItem?.type === item.type &&
                                              (item.type === "friend"
                                                ? selectedItem?.userId === item.userId
                                                : selectedItem?.groupId === item.groupId)
                                                ? "selected"
                                                : ""
                                            }`}
                                            // onMouseEnter={() => setHoveredMessageId(item.email)}
                                            // onMouseLeave={() => setHoveredMessageId(null)}
                                            onMouseEnter={() => {
                                              setHoveredMessageId(item.email);
                                              setHoveredMessageType(item.type);  // Cập nhật thêm loại item khi hover
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredMessageId(null);
                                                setHoveredMessageType(null);  // Xóa loại item khi không hover nữa
                                            }}
                                            onClick={() => {
                                              setSelectedItem(item); 
                                              if (item.type === "friend") {
                                                setSelectedUser(item); // chọn user
                                                navigate("/user/home", { state: { friend: item, groupId: item.userId } });
                                              } else {
                                                setSelectedGroup(item); // chọn group
                                                navigate("/user/home", { state: { friend: item, groupId: item.groupId } });
                                              }
                                        }}
                                    >
                                        <div className="avatar-icon">
                                        <img
                                            src={item.avatar || "https://cdn.pixabay.com/photo/2025/03/18/17/03/dog-9478487_1280.jpg"}
                                            alt={item.type === "friend" ? item.fullName : item.name}
                                        />
                                        </div>
                                        <div className="message-content">
                                            <div className="message-header">
                                                <span className="message-name">{item.type === "friend" ? item.fullName : item.name}</span>
                                                <span 
                                                    className="message-time" 
                                                    onClick={(e) => {
                                                        if (item.type === "friend"){
                                                          setSelectedUser(item);
                                                        } else {
                                                          setSelectedGroup(item);
                                                        }
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
                                                  {hoveredMessageId === (item.type === "friend" ? item.userId : item.groupId) &&
                                                    hoveredMessageType === item.type
                                                      ? <MoreOutlined />
                                                      : displayTime}
                                                </span>
                                            </div>
                                            <div className="message-text">
                                                {messageLabel}
                                            </div>
                                        </div>
                                    </div>
                                    )
                                })}
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
                        ) : (
                        <div className='menu-contact'>
                            <Link to="list-friend">
                                <div className='menu-item'>
                                    <UserAddOutlined className="icon-adduser"/>
                                    <p className='menu-item-name'>Danh sách bạn bè</p>
                                </div>
                            </Link>
                            <Link to="list-group">
                                <div className='menu-item'>
                                    <UserAddOutlined className="icon-adduser"/>
                                    <p className='menu-item-name'>Danh sách nhóm</p>
                                </div>
                            </Link>
                            <Link to="request-friend">
                                <div className='menu-item'>
                                    <UserAddOutlined className="icon-adduser"/>
                                    <p className='menu-item-name'>Lời mời kết bạn</p>
                                </div>
                            </Link>
                            <Link to="danh-sach-loi-moi-vao-nhom">
                                <div className='menu-item'>
                                    <UserAddOutlined className="icon-adduser"/>
                                    <p className='menu-item-name'>Lời mời vào nhóm</p>
                                </div>
                            </Link>
                        </div>
                        )}
                </div>
                )}

            {/* Modal hiển thị thông tin chi tiết */}
            {selectedUserSearch && (
                <Modal isOpen={isModalOpenUser} onRequestClose={handleCloseModal} className="user-modal" overlayClassName="overlay">
                    <div className="modal-content">
                        <div className="title-modal">
                            <p>Thông tin tài khoản</p>
                            <CloseOutlined className="icon-close-modal-user" onClick={handleCloseModal}/>
                        </div>
                        <div className="cover-img">
                            <img src={selectedUserSearch.avatar} alt="Cover Image" className="cover-img" />
                        </div>
                        <div className="info-modal">
                            <div className="name-info">
                                <img src={selectedUserSearch.avatar} alt='Avatar' className='avt-img'/>
                                <div className="name-setting">
                                    <p>{selectedUserSearch.fullName}</p>
                                    <FontAwesomeIcon icon={faPencil} />
                                </div>
                            </div>
                            <div className="btn-info">
                                {/* <button className="btn-addfriend">Thêm bạn bè</button> */}
                                {hasSentRequest ? (
                                    <button className="btn-addfriend" onClick={() => cancelFriendRequest(selectedUserSearch.email)}>Hủy lời mời</button>
                                    ) : (
                                    <button className="btn-addfriend" onClick={() => sendFriendRequest(selectedUserSearch.email)}>Thêm bạn bè</button>
                                )}
                                <button className="btn-chat">Nhắn tin</button>
                            </div>
                        </div>
                        <div className="info-detail">
                            <p className='info-detail-title'>Thông tin cá nhân</p>
                            <div className="info-detail-item">
                                <p>Email</p>
                                <span>{selectedUserSearch.email}</span>
                            </div>
                            <div className="info-detail-item">
                                <p>Số điện thoại</p>
                                <span>{selectedUserSearch.phoneNumber}</span>
                            </div>
                        </div>
                        <div className="btn-modal-other"></div>
                    </div>
                </Modal>
            )}

        </div>

        <Modal isOpen={isModalOpenGroup} onRequestClose={handleCloseModalGroup} className="create-group-modal" overlayClassName="overlay">
          <div className="modal-content">
              <div className="title-modal title-create-group">
                  <p>Tạo nhóm</p>
                  <CloseOutlined className="icon-close-modal-user" onClick={handleCloseModalGroup}/>
              </div>

              <div className="create-search">
                <div className="info-group">
                  <div className="icon-camera">
                    <CameraOutlined className="icon-choose-img"/>
                  </div>
                  <div className="input-name">
                      <input 
                        type="text" 
                        placeholder="Nhập tên nhóm..." 
                        value={groupNameInput}
                        onChange={(e) => setGroupNameInput(e.target.value)}
                      />
                  </div>
                </div>
                <div className="search-mem">
                    <FontAwesomeIcon icon={faSearch} />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm thành viên..."
                      value={searchFriendTerm}
                      onChange={(e) => setSearchFriendTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchFriend();
                        }
                      }}
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
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => (
                      <div key={friend.email} className="user-item group-item">
                        <label className="info-user">
                          <input
                            type="checkbox"
                            style={{ marginRight: '8px' }}
                            checked={selectedFriends.includes(friend.email)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFriends([...selectedFriends, friend.email]);
                              } else {
                                setSelectedFriends(selectedFriends.filter(email => email !== friend.email));
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
                  <button className="btn-cancle" onClick={handleCloseModalGroup}>Hủy</button>
                  <button className={`btn-create-group ${selectedFriends.length >= 2 ? 'active-group' : ''}`} onClick={handleCreateGroup}>Tạo nhóm</button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default Navbar;
