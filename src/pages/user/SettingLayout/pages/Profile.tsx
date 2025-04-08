import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import "../../../../assets/styles/Profile.css"; 
import { useState } from "react";


const Profile = () => {
  const [user, setUser] = useState({
    displayName: "Nguyễn Minh Tuấn",
    avatar: "https://i.pinimg.com/736x/d9/34/71/d9347133962a3772c95ac2b581cc68af.jpg",
    backgroundImage: "https://i.pinimg.com/736x/45/7c/20/457c2047eb9f1eaff176f71fe3294b80.jpg",
    dateOfBirth: "20/07/1999",
    phoneNumber: "+84 912 345 678",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, backgroundImage: imageUrl }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Thông tin đã được lưu!");
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-background-wrapper">
          <div
            className="profile-background"
            style={{ backgroundImage: `url(${user.backgroundImage})` }}
          ></div>
          {isEditing && (
            <label className="camera-icon background-camera">
              <input type="file" accept="image/*" onChange={handleBackgroundChange} />
              <div className="camera-overlay">
                <FontAwesomeIcon icon={faCamera} />
              </div>
            </label>
          
          )}
        </div>
  
        <div className="profile-content">
          <div className="avatar-wrapper">
            <img src={user.avatar} alt="Avatar" className="profile-avatar" />
            {isEditing && (
              <label className="camera-icon avatar-camera">
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                <div className="camera-icon-inner">
                  <FontAwesomeIcon icon={faCamera} />
                </div>
              </label>
            )}
          </div>
  
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <label>
                Tên hiển thị:
                <input
                  type="text"
                  name="displayName"
                  value={user.displayName}
                  onChange={handleChange}
                />
              </label>
  
              <label>
                Ngày sinh:
                <input
                  type="date"
                  name="dateOfBirth"
                  value={user.dateOfBirth}
                  onChange={handleChange}
                />
              </label>
  
              <label>
                Số điện thoại:
                <input
                  type="text"
                  name="phoneNumber"
                  value={user.phoneNumber}
                  onChange={handleChange}
                />
              </label>
  
              <button type="submit">Lưu</button>
              <button type="button" onClick={() => setIsEditing(false)}>Hủy</button>
            </form>
          ) : (
            <div className="profile-info">
              <h3>{user.displayName}</h3>
              <p><strong>Ngày sinh:</strong> {user.dateOfBirth}</p>
              <p><strong>SĐT:</strong> {user.phoneNumber}</p>
              <button onClick={() => setIsEditing(true)}>Chỉnh sửa hồ sơ</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default Profile;