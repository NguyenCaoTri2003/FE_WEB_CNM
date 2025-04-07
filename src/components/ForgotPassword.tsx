import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/ForgotPassword.css'; 

const ForgotPassword = () => {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    // Gửi yêu cầu khôi phục mật khẩu (có thể gọi API thật ở đây)
    console.log('Gửi yêu cầu khôi phục cho:', phone);
    alert('Yêu cầu khôi phục đã gửi!'); // hoặc điều hướng sang bước tiếp theo
  };

  return (
    <div className="forgot-password-container">
      <h1 className="zalo-title">Zalo</h1>
      <h2 className="title">Khôi phục mật khẩu</h2>
      <p className="description">
        Để khôi phục mật khẩu, vui lòng nhập số điện thoại đã đăng ký hoặc đăng nhập tài khoản Zalo
      </p>

      <form onSubmit={handleSubmit}>
        <div className="phone-input">
          <span className="prefix">+84</span>
          <input
            type="text"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button className="submit-btn" type="submit" disabled={!phone.trim()}>
          Tiếp tục
        </button>
      </form>

      <button className="cancel-btn" onClick={() => navigate('/')}>
        Hủy
      </button>
    </div>
  );
};

export default ForgotPassword;
