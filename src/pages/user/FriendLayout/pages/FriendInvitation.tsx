import "../../../../assets/styles/FriendInvitation.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "config/api";

// interface FriendRequest {
//     senderEmail: string;
//     senderName: string;
//     senderAvatar: string;
// }

interface FriendRequest {
    email: string;
    fullName: string;
    avatar: string;
}
  
interface FriendRequestResponse {
    success: boolean;
    data: {
        received: FriendRequest[];
    };
}

interface FriendRequestResponses {
    success: boolean;
    message: string;
  }

const FriendInvitation: React.FC = () => {
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);

    useEffect(() => {
        // Fetch friend requests from API
        const fetchFriendRequests = async () => {
          setLoading(true);
          try {
            const token = localStorage.getItem('token'); // Lấy token từ localStorage
            if (!token) {
              console.error('Người dùng chưa đăng nhập hoặc token không hợp lệ');
              return;
            }
    
            const response = await axios.get<FriendRequestResponse>(API_ENDPOINTS.friendRequest, {
              headers: {
                Authorization: `Bearer ${token}` // Gửi token qua header
              }
            });
    
            if (response.data.success) {
              setFriendRequests(response.data.data.received);
            } else {
              console.error('Lỗi khi lấy danh sách lời mời kết bạn');
            }
          } catch (err) {
            console.error('Lỗi khi gọi API:', err);
          }
          setLoading(false);
        };
    
        fetchFriendRequests();
    }, []);
    
    const handleRespondToRequest = async (senderEmail: string, accept: boolean) => {
        try {
            const token = localStorage.getItem('token'); // Lấy token từ localStorage
            if (!token) {
                console.error('Người dùng chưa đăng nhập hoặc token không hợp lệ');
                return;
            }
            const response = await axios.post<FriendRequestResponse>(API_ENDPOINTS.responđFriendRequest, {
                senderEmail,
                accept,
              }, {
                headers: {
                  Authorization: `Bearer ${token}`, // Đảm bảo gửi đúng token ở đây
                }
            });
      
          if (response.data.success) {
            // Cập nhật danh sách lời mời kết bạn sau khi phản hồi
            setFriendRequests(prevRequests => 
                prevRequests.filter(request => request.email !== senderEmail)
              );
          }
        } catch (error) {
          console.error("Lỗi phản hồi lời mời kết bạn:", error);
          alert("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
    };

    
    console.log(friendRequests);

  return (
    <div className="container-friend-invitation">
      <div className="title-friend-inv">
        <UserAddOutlined className="icon-adduser" />
        <p>Lời mời kết bạn</p>
      </div>
      <div className="list-friend-inv">
        {friendRequests.length === 0 ? (
            <p>Không có lời mời kết bạn nào</p>
        ) : (
            friendRequests.map((request) => (
            <div className="friend-invitation-item" key={request.email}>
                <div className="friend-invitation-info">
                <img
                    src={request.avatar || "https://via.placeholder.com/50"}
                    alt="Avatar"
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
    </div>
  );
};

export default FriendInvitation;
