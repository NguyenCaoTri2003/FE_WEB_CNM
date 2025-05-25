import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../assets/styles/Navbar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faContactBook, faTools, faCloud, faSearch, faPencil, faPen } from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from '../config/api';
import { CameraFilled ,UserOutlined, SettingOutlined, GlobalOutlined, QuestionCircleOutlined, UserSwitchOutlined, UsergroupAddOutlined, CameraOutlined ,UserAddOutlined, CloseOutlined, EllipsisOutlined, MoreOutlined, SettingTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { useMessageContext } from "../context/MessagesContext";
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import { useGlobalContext } from '../context/GlobalContext';
import { useGroupContext } from '../context/GroupContext';
import socket from 'routes/socket';
import { notification} from "antd";
import 'antd/dist/reset.css';

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

interface FriendRequestResponses {
  success: boolean;
  data: {
    received: { email: string }[];
    sent: { email: string }[];
  };
}



Modal.setAppElement("#root");

interface Message {
    id: number;
    name: string;
    message: string;
    time: string;
    senderEmail?: string;   
    senderName: string; 
}

interface Friend {
    userId: string;
    email: string;
    fullName: string;
    avatar: string; // optional
    phoneNumber?: string;
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

type GroupType = {
  groupId: string;
  name: string;
  description?: string;
  members: string[];
  avatar?: string; // optional
}

interface CreateGroupResponse {
  success: boolean;
  message?: string;
  data?: GroupType;
}

interface UnfriendResponse {
  success: boolean;
  message: string;
}

interface UserResponse{
  success: boolean;
  user: {
      fullName?: string;
      email: string;
      avatar?: string;
  };
};

type UploadAvatarResponse = {
    success: boolean;
    avatarUrl: string;
    message?: string;
  };

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
    const [notFound, setNotFound] = useState(false);
    const [searchResult, setSearchResult] = useState<any | null>(null); 

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
    const [activeTab, setActiveTab] = useState<"showHome" | "showContacts" | "showAllSetting" | null>("showHome");

    const [hasSentRequest, setHasSentRequest] = useState<boolean>(false);
    const [hasIncomingRequest, setHasIncomingRequest] = useState(false);

    const [friends, setFriends] = useState<Friend[]>([]);
    //const [groups, setGroups] = useState<Group[]>([]); 
    const { groups, fetchGroups, setGroups } = useGroupContext(); 

    const { lastMessages, updateLastMessage, removeLastMessage  } = useMessageContext()!;
    // const displayLastMessageTime = lastMessageTime ? lastMessageTime.toString().slice(0, 10) : 'Chưa có tin nhắn';
    const [storedMessage, setStoredMessage] = useState<{ message: string, time: Date } | null>(null);

    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

    //tìm kiếm bạn bè
    const [searchFriendTerm, setSearchFriendTerm] = useState('');
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>(friends); 

    //thêm nhóm
    const [groupNameInput, setGroupNameInput] = useState('');

    const [selectedItem, setSelectedItem] = useState<any>(null);

    const users = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserEmail = users.email ;

    const { unreadMessages, removeUnreadMessage, isInitialized  } = useUnreadMessages();

    const { setRefreshChat } = useGlobalContext();

    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [groupAvatarPreview, setGroupAvatarPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    



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
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Emit offline trước khi xóa user
          if (user?.email && socket?.connected) {
              socket.emit("userStatusWeb", {
                  status: "offline",
                  email: user.email
            });
        }
        navigate('/login');
    };


    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchTerm.trim()) {
        try {
          
          // const response = await axios.get<SearchUserResponse>(API_ENDPOINTS.search, {
          //   params: { email: searchTerm.trim(), phoneNumber: searchTerm.trim() }
          // });

          const isEmail = searchTerm.includes('@');
          const params = isEmail
            ? { email: searchTerm.trim() }
            : { phoneNumber: searchTerm.trim() };

          const response = await axios.get<SearchUserResponse>(API_ENDPOINTS.search, { params });
    
          if (response.data?.data) {
            const newUser = {
              ...response.data.data,
              searchedAt: new Date().toISOString()
            };
    
            if (
              (user?.email && user.email === newUser.email) ||
              (user?.phoneNumber && user.phoneNumber === newUser.phoneNumber)
            ) {
              navigate('/profile');
              return;
            }
    
            // Cập nhật localStorage nếu chưa có
            const existing = JSON.parse(localStorage.getItem("searchedUsers") || "[]");
            const alreadyExists = existing.some((u: any) => u.email === newUser.email);
            const updated = alreadyExists ? existing : [newUser, ...existing];
    
            localStorage.setItem("searchedUsers", JSON.stringify(updated));
            console.log("Searched Users:", updated);
            // 👉 chỉ hiện kết quả mới tìm
            setSearchResult(newUser);
            setSearchedUsers(updated); // Ẩn danh sách cũ
            setNotFound(false);
            setIsSearching(true);
          }  else {
            // Không có data trong response
            setSearchResult(null);
            setNotFound(true); 
          }
        } catch (err) {
          console.error("Tìm không thấy người dùng hoặc lỗi server", err);
          setSearchResult(null);
          setNotFound(true);
        }
      }
    };

    // useEffect(() => {
    //   if (isSearching && !searchResult) {
    //     const stored = JSON.parse(localStorage.getItem("searchedUsers") || "[]");

    //     const fiveDaysAgo = new Date();
    //     fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 9000);

    //     // Cập nhật lại thông tin người dùng mới nhất từ server
    //     const fetchUpdatedUsers = async () => {
    //       const refreshed = await Promise.all(
    //         stored.map(async (user: any) => {
    //           try {
    //             const isEmail = searchTerm.includes('@');
    //             const params = isEmail
    //               ? { email: searchTerm.trim() }
    //               : { phoneNumber: searchTerm.trim() };

    //             const response = await axios.get<SearchUserResponse>(API_ENDPOINTS.search, { params });
    //             return { ...response.data.data, searchedAt: user.searchedAt };
    //           } catch {
    //             return user; // fallback nếu bị lỗi
    //           }
    //         })
    //       );
    //       const filtered = refreshed.filter(
    //         (user: any) => new Date(user.searchedAt) >= fiveDaysAgo
    //       );
    //       setSearchedUsers(filtered);
    //     };

    //     fetchUpdatedUsers();
    //   }
    // }, [isSearching, searchResult]);

    useEffect(() => {
      if (isSearching && !searchResult) {
        const stored = JSON.parse(localStorage.getItem("searchedUsers") || "[]");

        const fetchUpdatedUsers = async () => {
          const refreshed = await Promise.all(
            stored.map(async (user: any) => {
              try {
                const isEmail = user.email && user.email.includes('@'); 
                const params = isEmail
                  ? { email: user.email }
                  : { phoneNumber: user.phoneNumber };

                const response = await axios.get<SearchUserResponse>(API_ENDPOINTS.search, { params });
                return { ...response.data.data, searchedAt: user.searchedAt };
              } catch {
                return user; 
              }
            })
          );

          setSearchedUsers(refreshed);
        };

        fetchUpdatedUsers();
      }
    }, [isSearching, searchResult]);

    const handleClearSearchUser = () => {
      setSearchTerm('');
      setSearchResult(null); // 👉 bỏ kết quả hiện tại
      setIsSearching(true);  // 👉 hiển thị lại lịch sử
      setNotFound(false);
    };

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
    // 
  
    useEffect(() => {
        fetchFriends();
    }, []);

    // Gửi lời mời kết bạn
    const sendFriendRequest = async (receiverEmail: string) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserEmail  = user.email;

      console.log("currentUserEmail:", currentUserEmail);
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
        // Kiểm tra giá trị
    
        if (response.data.success) {
          console.log("Đã gửi lời mời kết bạn");
          setHasSentRequest(true);

          socket.emit("friendRequestSent", {
            senderEmail: currentUserEmail,
            receiverEmail: receiverEmail,
          });

          if (currentUserEmail == receiverEmail) {
            setHasIncomingRequest(true);  // Người nhận lời mời 
          }
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
            socket.emit("withdrawFriendRequest", {
              senderEmail: currentUserEmail,
              receiverEmail,
            });
          } else {
            console.log(response.data.message);
          }
        } catch (err) {
          console.error(err);
          console.log("Lỗi khi thu hồi lời mời");
        }
    };

    useEffect(() => {
      // Lắng nghe sự kiện khi có lời mời kết bạn mới
      socket.on("friendRequestSent", (data: any) => {
        console.log("Có lời mời kết bạn mới:", data);
        setHasIncomingRequest(true);
      });

      // Lắng nghe sự kiện khi có lời mời bị thu hồi
      socket.on("friendRequestWithdrawn", (data: any) => {
        console.log("Lời mời kết bạn bị thu hồi:", data);
        setHasIncomingRequest(false);
      });
      socket.on("friendRequestAccepted", (data: any) => {
        console.log("Lời mời kết bạn đã được chấp nhận:", data);
        fetchFriends();
      });

      return () => {
        socket.off("friendRequestSent");
        socket.off("friendRequestWithdrawn");
        socket.off("friendRequestAccepted");
      };
    }, []);

    const unfriend = async (friendEmail: string) => {
      try {
          const token = localStorage.getItem("token");
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const myEmail = user.email;
          if (!token) {
              console.error("Token không tồn tại, người dùng chưa đăng nhập");
              return;
          }
  
          const response = await axios.post<UnfriendResponse>(
              API_ENDPOINTS.unFriend, 
              { friendEmail },
              {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              }
          );
  
          if (response.data.success) {
              console.log("Đã hủy kết bạn thành công");
  
              // Xóa người bạn đó khỏi danh sách friends
              setFriends(prevFriends => prevFriends.filter(friend => friend.email !== friendEmail));
              removeLastMessage(friendEmail);
              setRefreshChat(true); // Cập nhật lại trạng thái chat
              // Nếu người đang xem (selectedUserSearch) vừa bị hủy, thì cập nhật luôn trạng thái
              if (selectedUserSearch?.email === friendEmail) {
                fetchFriends();
                setHasSentRequest(false); // Cẩn thận reset luôn trạng thái lời mời
              }
              socket.emit("unfriend", {
                targetEmail: friendEmail,
              });
          } else {
              console.error(response.data.message);
          }
      } catch (error) {
          console.error("Lỗi khi hủy kết bạn:", error);
      }
    };

    const handleRespondToRequest = async (senderEmail: string, accept: boolean) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserEmail  = user.email;
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              console.error('Người dùng chưa đăng nhập hoặc token không hợp lệ');
              return;
          }
          const response = await axios.post<FriendRequestResponse>(API_ENDPOINTS.respondFriendRequest, {
              senderEmail,
              accept,
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
              }
          });
    
          if (response.data.success) {
            if (accept) {
              console.log("Đã chấp nhận lời mời kết bạn");

              socket.emit('friendRequestAccepted', {
                email: senderEmail,
              });

              removeLastMessage(senderEmail); 
              setRefreshChat(true);
              // Cập nhật trạng thái cho người B khi đã chấp nhận lời mời
              if (currentUserEmail === senderEmail) {
                setHasSentRequest(true);  // Người A đã gửi lời mời
              } else {
                setHasIncomingRequest(false);  // Người B đã chấp nhận
              }
              const friend = {
                email: senderEmail,
                fullName: "", // Bạn có thể gọi API để lấy thêm thông tin này nếu cần
                avatar: "",   // Hoặc truyền avatar nếu có
                userId: "",   // ID của người gửi (nếu có)
                type: "friend",
              };
            
              // 👉 Thêm vào localStorage
              const existing = JSON.parse(localStorage.getItem("messagedUsers") || "[]");
              const isExist = existing.some((f: any) => f.email === senderEmail && f.type === "friend");
              if (!isExist) {
                localStorage.setItem("messagedUsers", JSON.stringify([...existing, friend]));
              }            
            } else {
              console.log("Đã từ chối lời mời kết bạn");
              setHasIncomingRequest(false);  // Người B đã từ chối
            }
            setHasIncomingRequest(false);  // Xóa trạng thái lời mời sau khi phản hồi
          } else {
            console.error(response.data.message);
          }
      } catch (error) {
        console.error("Không thể phản hồi lời mời kết bạn:", error);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      }
  };
  
    
      
    const isFriend = selectedUserSearch 
    ? friends.some(friend => friend.email === selectedUserSearch.email) 
    : false;

    const fetchFriendRequests = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserEmail = user.email;
    
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
    
        const response = await axios.get<FriendRequestResponses>(`${API_ENDPOINTS.getFriendRequests}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (response.data.success) {
          const { received, sent } = response.data.data;
    
          // Kiểm tra xem selectedUserSearch có nằm trong danh sách đã nhận lời mời hay không
          const isIncoming = received.some(
            (req) => req.email === selectedUserSearch?.email
          );
          setHasIncomingRequest(isIncoming);
    
          // Kiểm tra xem selectedUserSearch có nằm trong danh sách đã gửi lời mời hay không
          const isSent = sent.some(
            (req) => req.email === selectedUserSearch?.email
          );
          setHasSentRequest(isSent);
        }
      } catch (error) {
        console.error("Lỗi khi lấy lời mời kết bạn:", error);
      }
    };

    useEffect(() => {
      if (selectedUserSearch) {
        fetchFriends();
        fetchFriendRequests(); // Gọi khi có selectedUserSearch
      }
    }, [selectedUserSearch]);

    // const fetchGroups = async () => {
    //   try {
    //     const token = localStorage.getItem('token'); // Lấy token từ localStorage
    //     const response = await axios.get<GroupResponse>(API_ENDPOINTS.getGroups, {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //       },
    //     });

    //     if (response.data.success) {
    //       setGroups(response.data.data); // Cập nhật state nhóm
    //     } else {
    //       console.error('Error fetching groups:', response.data.message);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching groups:', error);
    //   } finally {
    //     // setLoading(false);
    //   }
    // };

    useEffect(() => {
      fetchGroups();
    }, []);

    

      
    useEffect(() => {
        // Lấy tin nhắn cuối từ localStorage khi component mount
        const stored = localStorage.getItem(`lastMessages_${currentUserEmail}`);
        if (stored) {
            setStoredMessage(JSON.parse(stored));
        }
    }, []);

    // console.log("storedMessage context:", storedMessage);
    // console.log("lastMessage context:", lastMessages);
    

  useEffect(() => {
      setFilteredFriends(friends);
  }, [friends]);

  const handleUploadAvatar = async (file: File) => {
    const token = localStorage.getItem('token');
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
        console.log('Avatar uploaded successfully:', fileUrl);
        setGroupAvatarPreview(fileUrl); // set vào state để hiển thị ảnh
        notification.success({
          message: 'Upload avatar thành công!'
        });

      } else {
        alert('Upload avatar thất bại!');
      }
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      alert('Upload thất bại!');
    }
  };

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
      description: '', 
      members: selectedFriends, 
      avatar: groupAvatarPreview || '', 
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
        notification.success({
          message: 'Tạo nhóm thành công!',
          description: `Nhóm "${groupName}" đã được tạo.`,
        });
        const newGroup = response.data.data; 
        if (!newGroup) {
          return;
        }

        updateLastMessage(newGroup.groupId, 'Bạn đã tạo nhóm', new Date(), currentUserEmail);
        
        fetchGroups(); // Cập nhật danh sách nhóm
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

  // Hàm này sẽ được gọi khi người dùng nhấn vào một người dùng trong danh sách
  type CombinedItem = 
    | (Friend & { type: "friend" })
    | (Group & { type: "group" });

  const combinedList: CombinedItem[] = [
    ...friends.map(friend => ({ ...friend, type: "friend" as const })),
    ...groups.map(group => ({ ...group, type: "group" as const }))
  ];

  const updateMessagedUsers = (userOrGroup: CombinedItem) => {
    const stored = JSON.parse(localStorage.getItem("messagedUsers") || "[]");
    

    const id = userOrGroup.type === "friend" ? userOrGroup.userId : userOrGroup.groupId;

    const isExist = stored.some((u: any) =>
      (u.type === "friend" ? u.userId : u.groupId) === id
    );

    if (!isExist) {
      const updated = [userOrGroup, ...stored];
      localStorage.setItem("messagedUsers", JSON.stringify(updated));
  }
  };
  const [combinedLists, setCombinedLists] = useState<CombinedItem[]>([]);
  


  useEffect(() => {
    const fetchData = async () => {
      // Kiểu rõ ràng
      type MessagedUser = 
        | (Friend & { type: "friend" }) 
        | (Group & { type: "group" });
  
      const stored = JSON.parse(localStorage.getItem("messagedUsers") || "[]") as MessagedUser[];
  
      const enrichedList = stored.map((u): CombinedItem | null => {
        if (u.type === "friend") {
          const matched = friends.find((f) => f.userId === u.userId);
          return matched ? { ...matched, type: "friend" as const } : null;
        } else if (u.type === "group") {
          const matched = groups.find((g) => g.groupId === u.groupId);
          return matched ? { ...matched, type: "group" as const } : null;
        }
        return null;
      }).filter((item): item is CombinedItem => item !== null);
  
      setCombinedLists(enrichedList);
    };
  
    fetchData();
  }, [friends, groups]);

  const [emailToNameMap, setEmailToNameMap] = useState<Record<string, string>>({});


  const getFullNameByEmail = async (senderEmail: string) => {

    if (emailToNameMap[senderEmail]) return emailToNameMap[senderEmail];

    try {
        const token = localStorage.getItem('token');
         const response = await axios.get<UserResponse>(`${API_ENDPOINTS.getProfileByEmail(senderEmail)}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = response.data;

        if (data.success && data.user) {
            setEmailToNameMap((prev) => ({ ...prev, [senderEmail]: data.user.fullName || 'Người dùng' }));

            return data.user.fullName || 'Người dùng'; // Trả về fullName hoặc 'Người dùng' nếu không có tên
        } else {
            return 'Người dùng';
        }
    } catch (error) {
        console.error('Error fetching sender name:', error);
        return 'Người dùng';
    }
  };

  useEffect(() => {
    const fetchSenderNames = async () => {
      const missingEmails: string[] = [];

      [...combinedList].forEach(item => {
        const id = item.type === "friend" ? item.email : item.groupId;
        const last = lastMessages[id];
        const senderEmail = last?.senderEmail;

        if (senderEmail && !emailToNameMap[senderEmail] && senderEmail !== currentUserEmail) {
          missingEmails.push(senderEmail);
        }
      });

      // Lấy từng tên người dùng còn thiếu
      for (const email of missingEmails) {
        await getFullNameByEmail(email);
      }
    };

    fetchSenderNames();
  }, [combinedList]);

  // const handleClearMessagesForMe = async () => {
  //     const token = localStorage.getItem("token");
  //     const conversationId = selectedItem.type === "friend"
  //         ? [currentUserEmail, selectedItem.email].sort().join("-")
  //         : selectedItem.groupId;

  //     try {
  //         await axios.delete(`${API_ENDPOINTS.hideMessage(conversationId)}`, {
  //             headers: {
  //                 Authorization: `Bearer ${token}`
  //             }
  //         });

  //         notification.success({
  //             message: "Xóa tin nhắn thành công",
  //         });
  //         setCombinedLists(prev => prev.filter(item => item !== selectedItem));
  //         setSelectedItem(null);
  //         updateLastMessage(conversationId, "", new Date, "");
  //         setIsModalOpen(false);
  //     } catch (err) {
  //         console.error("Lỗi khi xóa:", err);
  //     }
  // };

    const handleClearMessagesForMe = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const myEmail = user.email;

      try {
          if (selectedItem.type === "friend") {
              // Tin nhắn 1-1: gọi endpoint khác
              await axios.delete(`${API_ENDPOINTS.hideMessage(selectedItem.email)}`, {
                  headers: {
                      Authorization: `Bearer ${token}`
                  }
              });
              updateLastMessage(selectedItem.email, "", new Date, myEmail);
        } 
          else {
              // Tin nhắn nhóm
              await axios.delete(`${API_ENDPOINTS.hideMessageGroup(selectedItem.groupId)}`, {
                  headers: {
                      Authorization: `Bearer ${token}`
                  }
              });
              updateLastMessage(selectedItem.groupId, "", new Date, myEmail);
          }

          notification.success({
              message: "Xóa tin nhắn thành công",
          });
          setCombinedLists(prev => prev.filter(item => item !== selectedItem));
          setSelectedItem(null);

          
          setIsModalOpen(false);
      } catch (error) {
          console.error("Lỗi khi ẩn tin nhắn:", error);
      }
    };

    // useEffect(() => {
    //     const handler = ({ fromUserId }: { fromUserId: string }) => {
    //         alert(`${fromUserId} đang gọi bạn!`);
            
    //             navigate(`/call/${fromUserId}`);
            
    //         console.log("📞 Này bên navbar nè:", fromUserId);
    //     };

    //     socket.on("incoming-call", handler);

    //     return () => {
    //         socket.off("incoming-call", handler); 
    //     };
    // }, []);


  if (!isInitialized) return null;
  
    

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
              <div className={`icon-chat ${activeTab === "showHome" ? "activeTab" : ""}`}>
                <FontAwesomeIcon icon={faComments} 
                  onClick={() => {
                    setActiveTab("showHome")
                    fetchFriends();
                    fetchGroups();
                    setIsSearching(false);
                    setSearchTerm('');
                    setSearchedUsers([]);
                    setNotFound(false);
                  }}
                />
              </div>
            </Link>
              <div className={`icon-contact ${activeTab === "showContacts" ? "activeTab" : ""}`}>
                <FontAwesomeIcon icon={faContactBook} 
                  onClick={() =>  {
                    setActiveTab("showContacts")
                    setIsSearching(false);
                    setSearchTerm('');
                    setSearchedUsers([]);
                    setNotFound(false);
                  }}/>
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
              <div className="menu-item" 
                onClick={() => {
                  setActiveTab("showAllSetting");
                  setShowSettings(!showSettings)} } 
                >
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
            {/* khung search */}
            <div className="search-section">
                <div className="search-input">
                  <FontAwesomeIcon icon={faSearch} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      if (!searchResult) setIsSearching(true);
                    }}
                    onKeyDown={handleSearch}
                  />
                  {searchTerm && (
                    <CloseOutlined className="icon-clear" onClick={handleClearSearchUser} />
                  )}
                </div>
                <div className="icon-section">
                    {isSearching ? (
                        <button className="close-button" onClick={() => {
                            setIsSearching(false);
                            setSearchTerm('');
                            setSearchedUsers([]);
                            setNotFound(false);
                            fetchFriends(); // Để cập nhật lại danh sách bạn bè
                            fetchGroups();

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
                searchResult ? (
                  <div className="user-search">
                    <div className="title-search"><p>Kết quả tìm kiếm</p></div>
                    <div className="list-search">
                      <div className="user-item" onClick={() => handleUserClick(searchResult)}>
                        <div className="info-user">
                          <img src={searchResult.avatar} alt="User" />
                          <div className="user-name">{searchResult.fullName}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : notFound ? (
                  <div className="user-search">
                    <div className="title-search"><p>Kết quả tìm kiếm</p></div>
                    <div className="list-search">
                      <p style={{ padding: "1rem", color: "gray" }}>Không tìm thấy người dùng nào.</p>
                    </div>
                  </div>
                ) : (
                  <div className="user-search">
                    <div className="title-search"><p>Tìm gần đây</p></div>
                    <div className="list-search">
                      {searchedUsers.length > 0 ? (
                        searchedUsers.map((user, index) => (
                          <div key={user.email + index} className="user-item" onClick={() => handleUserClick(user)}>
                            <div className="info-user">
                              <img src={user.avatar} alt="User" />
                              <div className="user-name">{user.fullName}</div>
                            </div>
                            <CloseOutlined className="icon-close" onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveUser(user.email);
                            }} />
                          </div>
                        ))
                      ) : (
                        <p>Không tìm thấy người dùng nào.</p>
                      )}
                    </div>
                  </div>
                )
            ) : (
                <div className="left-section">
                  {/* khu vực danh sách chat và menu bạn bè */}
                    {activeTab === "showHome" && (
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
                                {[...combinedList]
                                  .sort((a, b) => {
                                      const idA = a.type === "friend" ? a.email : a.groupId;
                                      const idB = b.type === "friend" ? b.email : b.groupId;

                                      const timeA = lastMessages[idA]?.time ? new Date(lastMessages[idA].time).getTime() : 0;
                                      const timeB = lastMessages[idB]?.time ? new Date(lastMessages[idB].time).getTime() : 0;

                                      return timeB - timeA; // tin nhắn mới nhất lên đầu
                                  }).map((item) => {
                                    const id = item.type === "friend" ? item.email : item.groupId;
                                    const last = lastMessages[id];
                                    const g = item.type === "group" ? groups.find((group) => group.groupId === item.groupId) : null;

                                    const isImage = last?.message?.startsWith("http") && /\.(jpg|jpeg|png|gif)$/i.test(last.message);
                                    const isFile = last?.message?.startsWith("http") && !isImage;
                                    // const isRecall = last?.message === undefined;

                                    // console.log("last Email:", last?.senderEmail);
                                    // console.log("lastMessages:", last);
                                    // console.log("id:", id);
                                    // console.log("item.groupId:", g);

                                    const senderNamePrefix = (() => {
                                        if (!last?.senderEmail) return "";
                                        if (last.senderEmail === currentUserEmail) return "Bạn";
                                        if (item.type === "friend") return item.fullName; // Chat đơn thì dùng tên người kia
                                        //if (item.type === "group") return last.senderEmail || "Người dùng"; // Chat nhóm thì dùng tên người gửi từ tin nhắn
                                        if (item.type === "group") return emailToNameMap[last.senderEmail] || last.senderEmail || "Người dùng";
                                    })();

                                    

                                    const messageLabel = isImage
                                      ? `${senderNamePrefix}: 🖼️ Hình ảnh`
                                      : isFile
                                      ? `${senderNamePrefix}: 📎 Tệp tin`
                                      : `${senderNamePrefix}: ${last?.message || "Chưa có tin nhắn"}`;

                                      // const messageLabel = isImage
                                      //   ? "🖼️ Hình ảnh"
                                      //   : isFile
                                      //   ? "📎 Tệp tin"
                                      //   // : isRecall
                                      //   // ? "Tin nhắn đã được thu hồi"
                                      //   : last?.message || "Chưa có tin nhắn";
                                        

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
                                              // const id = item.type === "friend" ? item.email : item.groupId;

                                              // Xóa khỏi unreadMessages khi click vào
                                              removeUnreadMessage(id);

                                              updateMessagedUsers(item);
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
                                                {/* <span 
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
                                                </span> */}
                                                <span
                                                  className="message-time"
                                                  onMouseEnter={() => {
                                                    setHoveredMessageId(item.type === "friend" ? item.userId : item.groupId);
                                                    setHoveredMessageType(item.type);
                                                  }}
                                                  onMouseLeave={() => {
                                                    setHoveredMessageId(null);
                                                    setHoveredMessageType(null);
                                                  }}
                                                  onClick={(e) => {
                                                    if (item.type === "friend") {
                                                      setSelectedUser(item);
                                                    } else {
                                                      setSelectedGroup(item);
                                                    }
                                                    setIsModalOpen(true);

                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const windowHeight = window.innerHeight;
                                                    const modalHeight = 100;
                                                    const topPosition = (rect.bottom + modalHeight > windowHeight - 200)
                                                      ? rect.top - modalHeight - 10
                                                      : rect.bottom + 5;

                                                    setModalPosition({
                                                      top: topPosition,
                                                      left: rect.left,
                                                    });
                                                  }}
                                                >
                                                  {hoveredMessageId === (item.type === "friend" ? item.userId : item.groupId) &&
                                                  hoveredMessageType === item.type ? (
                                                    <MoreOutlined />
                                                  ) : (
                                                    displayTime
                                                  )}
                                                </span>
                                            </div>
                                            <div key={id} className={`message-text ${unreadMessages.has(id) ? 'unread' : ''}`}>
                                                {messageLabel}
                                                {unreadMessages.has(id) && <span className="badges">New</span>}
                                            </div>
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                            <Modal
                                isOpen={isModalOpen}
                                onRequestClose={() => setIsModalOpen(false)}
                                className="custom-modal-message"
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
                                <p>Tùy chọn tin nhắn</p>
                                <button onClick={handleClearMessagesForMe}>Xóa tin nhắn</button>
                                <button onClick={() => console.log("Báo cáo")}>Báo cáo tin nhắn</button>
                                <button onClick={() => setIsModalOpen(false)}>Đóng</button>
                            </Modal>
                        </div>
                    )}
                    {activeTab === "showContacts" && (
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
                    {activeTab === "showAllSetting" && (
                      <div className='menu-contact'>
                          <Link to="update-password">
                              <div className='menu-item'>
                                  <SettingTwoTone className="icon-adduser"/>
                                  <p className='menu-item-name'>Cập nhật mật khẩu</p>
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
                                {isFriend ? (
                                  <>  
                                    <button className="btn-addfriend" onClick={() => unfriend(selectedUserSearch.email)}>Xóa bạn bè</button>
                                    <button className="btn-chat">Nhắn tin</button>
                                  </>
                                  
                                ) : (
                                  <>
                                    {hasIncomingRequest ? (
                                      <>
                                        <button className="btn-addfriend" onClick={() => handleRespondToRequest(selectedUserSearch.email, true)}>Chấp nhận</button>
                                        <button className="btn-addfriend" onClick={() => handleRespondToRequest(selectedUserSearch.email, false)}>Từ chối</button>
                                        <button className="btn-chat">Nhắn tin</button>
                                      </>
                                    ) : (
                                      <>
                                        {hasSentRequest ? (
                                          <button className="btn-addfriend" onClick={() => cancelFriendRequest(selectedUserSearch.email)}>Hủy lời mời</button>
                                        ) : (
                                          <button className="btn-addfriend" onClick={() => sendFriendRequest(selectedUserSearch.email)}>Thêm bạn bè</button>
                                        )}
                                        <button className="btn-chat">Nhắn tin</button>
                                      </>
                                    )}
                                  </>
                                )}
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


        {/* tạo nhóm mới */}
        <Modal isOpen={isModalOpenGroup} onRequestClose={handleCloseModalGroup} className="create-group-modal" overlayClassName="overlay">
          <div className="modal-content">
              <div className="title-modal title-create-group">
                  <p>Tạo nhóm</p>
                  <CloseOutlined className="icon-close-modal-user" onClick={handleCloseModalGroup}/>
              </div>

              <div className="create-search">
                <div className="info-group">
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadAvatar(file);
                      }
                    }}
                  />
                  <div className="icon-camera" onClick={() => fileInputRef.current?.click()}>
                     <CameraOutlined className="icon-choose-img" />
                      {groupAvatarPreview && <img src={groupAvatarPreview} alt="avatar" className="img-icon-camera" />}
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
