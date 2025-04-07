import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Register.css';

const Register = () => {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    if (phone.trim() === '') {
      alert('Vui lòng nhập số điện thoại');
      return;
    }

    navigate('/register/confirm', { state: { phone } });
  };

  return (
    <div className="register-container">
      <h1 className="zalo-title">Zalo</h1>
      <h2 className="register-title">Tạo tài khoản mới</h2>
      <p>Để tạo tài khoản mới, vui lòng nhập số điện thoại chưa từng đăng ký hoặc đăng nhập tài khoản Zalo.</p>
      <div className="phone-input-group">
        <span>+84</span>
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="phone-input-group">
        
        <input
          type="text"
          placeholder="Tên người dùng"
        />
      </div>

      <div className="phone-input-group">
        <input
          type="password"
          placeholder="Mật khẩu"
        />
      </div>

      <div className="phone-input-group">
        <input
          type="text"
          placeholder="Nhập lại mật khẩu"
        />
      </div>
      
      <button className="register-btn" onClick={handleNext}>
        Tiếp tục
      </button>
      <button className="cancel-btn" onClick={() => navigate('/login')}>Hủy</button>
    </div>
  );
};

export default Register;
