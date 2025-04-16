import React, { useState, useEffect } from 'react';
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Input, Button, message } from "antd";
import axios from 'axios';

// Interface cho kết quả tìm kiếm
interface SearchResult {
  email: string;
  fullName: string;
  phoneNumber: string;
  avatar: string;
}

interface SentRequest {
  email: string;
  fullName: string;
  avatar: string;
  status: string;
}

// Interface cho response từ API
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
}

const AddFriend = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);

  // Fetch sent friend requests
  useEffect(() => {
    const fetchSentRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get<ApiResponse<{ sent: SentRequest[] }>>('/api/friend-requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success && response.data.data) {
          setSentRequests(response.data.data.sent);
        }
      } catch (error) {
        console.error('Error fetching sent requests:', error);
      }
    };

    fetchSentRequests();
  }, []);

  const searchUserByPhoneNumber = async (phoneNumber: string): Promise<SearchResult> => {
    try {
      const response = await axios.get<ApiResponse<SearchResult>>(`/api/search?phoneNumber=${phoneNumber}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.user) {
        return response.data.user;
      } else {
        throw new Error(response.data.message || 'Không tìm thấy người dùng');
      }
    } catch (error) {
      throw new Error('Lỗi tìm kiếm người dùng');
    }
  };

  const sendFriendRequest = async (receiverEmail: string): Promise<void> => {
    try {
      const response = await axios.post<ApiResponse<void>>('/api/request',
        { receiverEmail },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Lỗi gửi lời mời kết bạn');
      }
    } catch (error) {
      throw new Error('Lỗi gửi lời mời kết bạn');
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');
      const user = await searchUserByPhoneNumber(phoneNumber);
      setSearchResult(user);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Có lỗi xảy ra');
      }
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!searchResult) return;

    try {
      setLoading(true);
      setError('');
      await sendFriendRequest(searchResult.email);
      message.success('Đã gửi lời mời kết bạn thành công');
      setPhoneNumber('');
      setSearchResult(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-friend-container">
      <div className="add-friend-header">
        <ArrowLeftOutlined onClick={() => navigate(-1)} className="back-icon" />
        <h3 className="add-friend-title">Thêm bạn</h3>
      </div>

      <div className="add-friend-search">
        <Input
          size="large"
          placeholder="Số điện thoại"
          prefix={<img src="https://cdn-icons-png.flaticon.com/512/197/197473.png" alt="VN" className="flag-icon" />}
          style={{ paddingLeft: "8px" }}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Button
          type="primary"
          onClick={handleSearch}
          disabled={loading || !phoneNumber}
          loading={loading}
        >
          {loading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {searchResult && (
        <div className="search-result">
          <div className="user-info">
            <img 
              src={searchResult.avatar} 
              alt={searchResult.fullName} 
              className="avatar"
            />
            <div className="user-details">
              <h3>{searchResult.fullName}</h3>
              <p>{searchResult.phoneNumber}</p>
            </div>
          </div>
          <Button 
            onClick={handleAddFriend}
            disabled={loading}
            className="add-friend-btn"
          >
            {loading ? 'Đang gửi...' : 'Thêm bạn'}
          </Button>
        </div>
      )}

      {/* Sent Requests Section */}
      {sentRequests.length > 0 && (
        <div className="sent-requests-section">
          <h3 className="section-title">Lời mời đã gửi</h3>
          <div className="sent-requests-list">
            {sentRequests.map((request) => (
              <div key={request.email} className="sent-request-item">
                <img 
                  src={request.avatar} 
                  alt={request.fullName} 
                  className="avatar"
                />
                <div className="request-info">
                  <h4>{request.fullName}</h4>
                  <p className="request-status">{request.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="add-friend-content">
        <p>Có thể bạn quen</p>

        <div className="suggestion-item">
          <img src="/avatar1.jpg" alt="Avatar" />
          <div className="suggestion-info">
            <div className="suggestion-name">Nguyễn Đức Duy</div>
            <div className="suggestion-sub">Từ gợi ý kết bạn</div>
          </div>
          <button className="suggestion-btn">Kết bạn</button>
        </div>

        <div className="suggestion-item">
          <img src="/avatar2.jpg" alt="Avatar" />
          <div className="suggestion-info">
            <div className="suggestion-name">Nguyễn Nhựt Phương</div>
            <div className="suggestion-sub">Từ gợi ý kết bạn</div>
          </div>
          <button className="suggestion-btn">Kết bạn</button>
        </div>

        <div className="suggestion-item">
          <img src="/avatar3.jpg" alt="Avatar" />
          <div className="suggestion-info">
            <div className="suggestion-name">Nguyen Quyen</div>
            <div className="suggestion-sub">Từ gợi ý kết bạn</div>
          </div>
          <button className="suggestion-btn">Kết bạn</button>
        </div>

        <span className="view-more">Xem thêm</span>
      </div>

      <div className="add-friend-footer">
        <Button className="cancel-button" onClick={() => navigate(-1)}>
          Hủy
        </Button>
      </div>
    </div>
  );
};

export default AddFriend;
