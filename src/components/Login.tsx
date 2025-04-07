import React, { useState, useEffect } from 'react';
import '../assets/styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';

const generateCaptcha = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let captcha = '';
  for (let i = 0; i < 5; i++) {
    captcha += chars[Math.floor(Math.random() * chars.length)];
  }
  return captcha;
};

const LoginForm = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());

  const navigate = useNavigate();

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !password || !captchaInput) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      alert('Mã kiểm tra không đúng!');
      refreshCaptcha();
      return;
    }

    // Nếu đúng
    console.log({ phone, password, captchaInput });
    navigate('/home');
  };

  return (
    <div className="login-container">
      <h1 className="zalo-title">Zalo</h1>
      <p className="login-title">Đăng nhập với mật khẩu</p>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span>+84</span>
          <input
            type="text"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="captcha-group">
          <input
            type="text"
            placeholder="Mã kiểm tra"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
          />
          <span className="captcha-img" onClick={refreshCaptcha} title="Click để làm mới">
            {captchaCode}
          </span>
        </div>
        <button type="submit" className="login-btn">Đăng nhập</button>
      </form>

      <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
      <div className="qr-login">Đăng nhập qua mã QR</div>

      <div className="register-link">
        Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay!</Link>
      </div>
    </div>
  );
};

export default LoginForm;
