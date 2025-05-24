import "../../../../assets/styles/FriendInvitation.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "config/api";
import socket from "routes/socket";

// interface FriendRequest {
//     senderEmail: string;
//     senderName: string;
//     senderAvatar: string;
// }

interface FriendRequest {
    email: string;
    fullName: string;
    avatar: string;
    status?: string;
}
  
interface FriendRequestResponse {
    success: boolean;
    data: {
        received: FriendRequest[];
        sent: FriendRequest[];
    };
}

interface FriendRequestResponses {
    success: boolean;
    message: string;
}

const FriendInvitation: React.FC = () => {
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);

    useEffect(() => {
        // Fetch friend requests from API
        const fetchFriendRequests = async () => {
          setLoading(true);
          try {
            const token = localStorage.getItem('token');
            if (!token) {
              console.error('Người dùng chưa đăng nhập hoặc token không hợp lệ');
              return;
            }
    
            const response = await axios.get<FriendRequestResponse>(API_ENDPOINTS.getFriendRequests, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
    
            if (response.data.success) {
              setFriendRequests(response.data.data.received);
              setSentRequests(response.data.data.sent);
            } else {
              console.error('Không thể tải danh sách lời mời kết bạn');
            }
          } catch (err) {
            console.error('Đã xảy ra lỗi khi tải danh sách lời mời:', err);
          }
          setLoading(false);
        };
    
        fetchFriendRequests();
    }, []);
    
    const handleRespondToRequest = async (senderEmail: string, accept: boolean) => {
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
            setFriendRequests(prevRequests => 
                prevRequests.filter(request => request.email !== senderEmail)
            );
          }
        } catch (error) {
          console.error("Không thể phản hồi lời mời kết bạn:", error);
          alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    };

    const handleCancelRequest = async (receiverEmail: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Người dùng chưa đăng nhập hoặc token không hợp lệ');
                return;
            }
            const response = await axios.post<FriendRequestResponses>(
                API_ENDPOINTS.withdrawFriendRequest,
                { receiverEmail },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setSentRequests(prevRequests =>
                    prevRequests.filter(request => request.email !== receiverEmail)
                );
            }
        } catch (error) {
            console.error("Không thể hủy lời mời kết bạn:", error);
            alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    };

    useEffect(() => {
      const handleNewFriendRequest = (data: any) => {
        if (data.type === "newRequest") {
          console.log("Nhận được lời mời kết bạn từ:", data.sender.fullName);
          setFriendRequests(prev => [
            ...prev,
            {
              email: data.sender.email,
              fullName: data.sender.fullName,
              avatar: data.sender.avatar,
            },
          ]);
        }
      };

      const handleFriendListUpdate = (data: any) => {
        if (data.type === "unfriend") {
          console.log("Bị hủy kết bạn với:", data.email);
          setFriendRequests(prev => prev.filter(friend => friend.email !== data.email));
        }
      };

      socket.on("friendRequestUpdate", handleNewFriendRequest);
      socket.on("friendListUpdate", handleFriendListUpdate);

      return () => {
        socket.off("friendRequestUpdate", handleNewFriendRequest);
        socket.off("friendListUpdate", handleFriendListUpdate);
      };
    }, []);

    if (loading) {
      return (
        <div className='spinnerContainer'>
          <div className='spinner'></div>
          <p>Vui lòng đợi trong giây lát...</p>
        </div>
      );
    }

  return (
    <div className="container-friend-invitation">
      <div className="title-friend-inv">
        <UserAddOutlined className="icon-adduser" />
        <p>Lời mời kết bạn</p>
      </div>

      {/* Received Requests Section */}
      <div className="section-title">
        <h3>Lời mời đã nhận ({friendRequests.length})</h3>
      </div>
      <div className="list-friend-inv">
        {loading ? (
          <p>Đang tải...</p>
        ) : friendRequests.length === 0 ? (
          <p>Bạn không có lời mời kết bạn nào</p>
        ) : (
          friendRequests.map((request) => (
            <div className="friend-invitation-item" key={request.email}>
              <div className="friend-invitation-info">
                <img
                  src={request.avatar || "https://via.placeholder.com/50"}
                  alt="Ảnh đại diện"
                  className="avatar-friend-invitation"
                />
                <p className="name-friend-invitation">{request.fullName}</p>
              </div>
              <div className="friend-invitation-btn">
                <button
                  className="btn-accept"
                  onClick={() => handleRespondToRequest(request.email, true)}
                >
                  Chấp nhận
                </button>
                <button
                  className="btn-decline"
                  onClick={() => handleRespondToRequest(request.email, false)}
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      

      {/* Sent Requests Section */}
      <div className="section-title">
        <h3>Lời mời đã gửi ({sentRequests.length})</h3>
      </div>
      <div className="list-friend-inv">
        {loading ? (
          <p>Đang tải...</p>
        ) : sentRequests.length === 0 ? (
          <p>Bạn chưa gửi lời mời kết bạn nào</p>
        ) : (
          sentRequests.map((request) => (
            <div className="friend-invitation-item" key={request.email}>
              <div className="friend-invitation-info">
                <img
                  src={request.avatar || "https://via.placeholder.com/50"}
                  alt="Ảnh đại diện"
                  className="avatar-friend-invitation"
                />
                <p className="name-friend-invitation">{request.fullName}</p>
              </div>
              <div className="friend-invitation-btn">
                <button
                  className="btn-decline"
                  onClick={() => handleCancelRequest(request.email)}
                >
                  Hủy lời mời
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendInvitation;
