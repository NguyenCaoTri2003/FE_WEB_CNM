import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/styles/Register.css';

const RegisterConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone;

  const handleCreateAccount = () => {
    alert(`Tạo tài khoản với số điện thoại: ${phone}`);
    navigate('/login');
  };

  if (!phone) {
    return (
      <div className="register-container">
        <p>Không có số điện thoại. Quay lại trang đăng ký.</p>
        <button onClick={() => navigate('/register')}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="register-container">
      <h1 className="zalo-title">Zalo</h1>
      <h2 className="register-title">Tạo tài khoản mới</h2>
      <p>Bạn có muốn tạo tài khoản Zalo bằng số điện thoại đã nhập bên dưới</p>
      <div className="phone-confirm">+84 {phone}</div>
      <p className="terms">
        Bằng việc bấm tạo tài khoản mới, bạn đã xác nhận đồng ý với các{' '}
        <a href="#">điều khoản & điều kiện</a> của Zalo.
      </p>
      <button className="register-btn" onClick={handleCreateAccount}>
        Tạo tài khoản mới
      </button>
      <button className="cancel-btn" onClick={() => navigate('/login')}>Hủy</button>
    </div>
  );
};

export default RegisterConfirm;
