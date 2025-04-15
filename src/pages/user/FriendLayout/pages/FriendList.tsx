import { Search, ChevronDown, MoreHorizontal, User } from "lucide-react";
import "../../../../assets/styles/FriendList.css";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "config/api";
import axios from "axios";
import React, { useState, useEffect } from "react";


interface Friend {
    email: string;
    fullName: string;
    avatar: string; // optional
}

interface FriendResponse {
    success: boolean;
    data: Friend[];
}

const FriendList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch friend list from API
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
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="contact-page">
      <div className="header-friend">
        <h1>Danh sách bạn bè</h1>
      </div>

      <div className="content-wrapper">
        <div className="friend-count">
          <h2>Bạn bè ({friends.length})</h2>
        </div>

        <div className="search-filter-container">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm bạn"
              className="search-input-friend"
              style={{ textIndent: "24px" }}
            />
          </div>
          <div className="filter-buttons">
            <button className="filter-button">
              <span>Tên (A-Z)</span>
              <ChevronDown className="filter-icon" />
            </button>
            <button className="filter-button">
              <span>Tất cả</span>
              <ChevronDown className="filter-icon" />
            </button>
          </div>
        </div>

        <div className="friend-list">
          {friends.map((friend, index) => (
            <div key={index} className="friend-group">
              <div className="friend-item">
                <div className="friend-info">
                  <div
                    className="friend-avatar"
                    style={{ backgroundColor: "#ffffff", color: "#000000", border: "1px solid #e5e7eb" }}
                  >
                    <img
                      src={friend.avatar || "https://via.placeholder.com/150"}
                      alt={friend.fullName}
                      className="avatar-image"
                    />
                  </div>
                  <span className="friend-name">{friend.fullName}</span>
                </div>
                <button className="more-button">
                  <MoreHorizontal className="more-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendList;
