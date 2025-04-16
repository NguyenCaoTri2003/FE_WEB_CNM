import React, { useState, useEffect } from "react";
import { Search, ChevronDown, MoreHorizontal } from "lucide-react";
import "../../../../assets/styles/FriendList.css";
import { API_ENDPOINTS } from "config/api";
import axios from "axios";

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
  const [activeFriend, setActiveFriend] = useState<string | null>(null); // Track active friend email
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null); // Track popup position

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

  const toggleFriendInfo = (email: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect(); // Get button position
    const popupWidth = 200; // Width of the popup (adjust based on your CSS)
    const popupHeight = 150; // Height of the popup (adjust based on your CSS)

    // Calculate initial position
    let top = rect.bottom + window.scrollY;
    let left = rect.left + window.scrollX;

    // Adjust position if popup goes out of viewport
    if (left + popupWidth > window.innerWidth) {
      left = window.innerWidth - popupWidth - 10; // Adjust to fit within the viewport
    }
    if (top + popupHeight > window.innerHeight) {
      top = rect.top + window.scrollY - popupHeight - 10; // Show above the button if it overflows
    }

    setActiveFriend((prev) => (prev === email ? null : email));
    setPopupPosition((prev) =>
      prev && activeFriend === email ? null : { top, left }
    );
  };

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
          {friends.map((friend) => (
            <div key={friend.email} className="friend-group">
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
                <button
                  className="more-button"
                  onClick={(event) => toggleFriendInfo(friend.email, event)}
                >
                  <MoreHorizontal className="more-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {activeFriend && popupPosition && (
          <div
            className="friend-info-popup"
            style={{
              position: "absolute",
              top: popupPosition.top,
              left: popupPosition.left,
              zIndex: 1000,
            }}
          >
            <ul>
              <li>Xem thông tin</li>
              <li>Phân loại</li>
              <li>Đặt tên gợi nhớ</li>
              <li>Chặn người này</li>
              <li className="delete-friend">Xóa bạn</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendList;
