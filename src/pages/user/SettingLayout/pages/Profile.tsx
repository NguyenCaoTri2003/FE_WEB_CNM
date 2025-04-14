import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faPen } from "@fortawesome/free-solid-svg-icons";
import "../../../../assets/styles/Profile.css";
import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { Spin, Typography, message } from "antd";
import { API_ENDPOINTS } from '../../../../config/api';

const { Title } = Typography;

interface UserProfile {
  email: string;
  fullName: string;
  phoneNumber: string;
  avatar: string;
  gender?: string;
  address?: string;
}

interface GetProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

type UploadAvatarResponse = {
  success: boolean;
  avatarUrl: string;
  message?: string;
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<GetProfileResponse>(API_ENDPOINTS.profile, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (res.data.success) {
          const genderMap: Record<string, string> = {
            true: 'male',
            false: 'female',
          };
  
          const genderKey = String(res.data.user.gender);
          const mappedUser = {
            ...res.data.user,
            gender: genderMap[genderKey] || '',
          };
  
          setUser(mappedUser);
        } else {
          message.error("Lỗi: " + res.data.message);
        }
      } catch (error: any) {
        message.error("Lỗi khi gọi API: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (user) {
      setUser({ ...user, [name]: value });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await axios.post<UploadAvatarResponse>(
          API_ENDPOINTS.uploadAvatar,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        window.dispatchEvent(new Event('avatarUpdated'));

        if (res.data.success) {
          setUser({ ...user, avatar: res.data.avatarUrl });
          message.success("Cập nhật ảnh đại diện thành công");
        } else {
          message.error("Cập nhật ảnh thất bại");
        }
      } catch (error: any) {
        message.error("Lỗi khi upload ảnh: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const dataToSend = {
        fullName: user?.fullName,
        phoneNumber: user?.phoneNumber,
        gender: user?.gender === 'male' ? true : user?.gender === 'female' ? false : undefined,
        address: user?.address?.trim() || null,
      };
      console.log("Data being sent to backend:", dataToSend);

      await axios.put(
        API_ENDPOINTS.profileweb,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      message.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error: any) {
      message.error("Lỗi cập nhật thông tin: " + (error.response?.data?.message || error.message));
      console.error("Error response from backend:", error.response?.data);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (user) {
      setUser({ ...user, [name]: value });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) return <Spin tip="Đang tải thông tin..." />;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-background-wrapper">
          <div
            className="profile-background"   
            style={{ backgroundImage: `url(${user?.avatar})` }}
          ></div>
        </div>

        <div className="profile-content">
          <div className="avatar-wrapper">
            <img src={user?.avatar} alt="Avatar" className="profile-avatar" />

            {/* Icon cây bút để đổi avatar */}
            <button className="edit-avatar-button" onClick={triggerFileInput}>
              <FontAwesomeIcon icon={faPen} />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <label>
                Họ tên:
                <input
                  type="text"
                  name="fullName"
                  value={user?.fullName || ""}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                Số điện thoại:
                <input
                  type="text"
                  name="phoneNumber"
                  value={user?.phoneNumber || ""}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                Giới tính:
                <select
                  name="gender"
                  value={user?.gender || ""}
                  onChange={handleSelectChange}
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </label>

              <label>
                Địa chỉ:
                <input
                  type="text"
                  name="address"
                  value={user?.address || ""}
                  onChange={handleInputChange}
                />
              </label>

              <label>
                Email :
                <input
                  type="email"
                  name="email"
                  value={user?.email || ""}
                  readOnly
                  disabled
                />
              </label>

              <button type="submit">Lưu</button>
              <button type="button" onClick={() => setIsEditing(false)}>Hủy</button>
            </form>
          ) : (
            <div className="profile-info">

              <h3>{user?.fullName}</h3>
              <div className="profile-info-item">
                <h5>Thông tin cá nhân</h5>
                <div className="profile-info-detail">
                  <div className="profile-info-detail-title">
                    <p>Giới tính</p>
                    <p>Số điện thoại</p>
                    <p>Địa chỉ</p>
                    <p>Email</p>
                  </div>
                  <div className="profile-info-detail-content">
                    <p>{user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</p>
                    <p>{user?.phoneNumber}</p>
                    <p>{user?.address || "Chưa cập nhật"}</p>
                    <p>{user?.email}</p>
                  </div>
                </div>
                
                <button onClick={() => setIsEditing(true)}>Chỉnh sửa hồ sơ</button>
              </div>

              {/* <h3>{user?.fullName}</h3>
              <p><strong>SĐT:</strong> {user?.phoneNumber}</p>
              <p><strong>Giới tính:</strong> {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</p>
              <p><strong>Địa chỉ:</strong> {user?.address || "Chưa cập nhật"}</p>
              <p><strong>Email:</strong> {user?.email}</p> */}
              
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
