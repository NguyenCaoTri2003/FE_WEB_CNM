import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import Captcha, { CaptchaRef } from './Captcha';
import '../assets/styles/ForgotPassword.css';

const { Title } = Typography;

interface ForgotPasswordForm {
  email: string;
  captcha: string;
}

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [emailError, setEmailError] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<string>('');
  const [resetSent, setResetSent] = useState(false);
  const [emailSent, setEmailSent] = useState('');
  const captchaRef = useRef<CaptchaRef>(null);
  const navigate = useNavigate();

  // Kiểm tra xem chuỗi nhập vào có phải là email hay không
  const isEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const onFinish = async (values: ForgotPasswordForm) => {
    // Kiểm tra captcha trước
    if (values.captcha !== captchaCode) {
      setCaptchaError('Mã xác nhận không đúng!');
      if (captchaRef.current) {
        captchaRef.current.refreshCaptcha();
      }
      return;
    }

    try {
      setLoading(true);
      setEmailError('');
      setCaptchaError('');
      
      // Kiểm tra định dạng email
      if (!isEmail(values.email)) {
        setEmailError('Vui lòng nhập email hợp lệ');
        setLoading(false);
        return;
      }
      
      // Gửi yêu cầu đặt lại mật khẩu
      await axios.post(API_ENDPOINTS.forgotPassword, {
        email: values.email
      });
      
      // Hiển thị thông báo thành công
      setResetSent(true);
      setEmailSent(values.email);
      message.success('Mã xác nhận đã được gửi đến email của bạn!');
    } catch (error: any) {
      if (error.response?.data?.error === 'EMAIL_NOT_FOUND') {
        setEmailError('Email không tồn tại trong hệ thống');
      } else {
        message.error('Không thể gửi mã xác nhận. Vui lòng thử lại sau!');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToResetPassword = () => {
    navigate('/reset-password', { state: { email: emailSent } });
  };

  return (
    <div className="forgot-password-container">
      <Card className="forgot-password-card">
        <div className="forgot-password-header">
          <Title level={2} className="forgot-password-title">Zalo</Title>
          <p className="forgot-password-subtitle">Khôi phục mật khẩu</p>
        </div>

        {resetSent ? (
          <div className="reset-email-sent">
            <Alert
              message="Mã xác nhận đã được gửi"
              description={`Chúng tôi đã gửi mã xác nhận đến địa chỉ email ${emailSent}. Vui lòng kiểm tra hộp thư đến và nhập mã xác nhận để đặt lại mật khẩu.`}
              type="success"
              showIcon
            />
            <Button 
              type="primary" 
              block 
              onClick={goToResetPassword}
              style={{ marginTop: '20px' }}
            >
              Tiếp tục đặt lại mật khẩu
            </Button>
            <Button 
              block 
              onClick={() => navigate('/login')}
              style={{ marginTop: '12px' }}
            >
              Quay lại đăng nhập
            </Button>
          </div>
        ) : (
          <Form<ForgotPasswordForm>
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
            className="forgot-password-form"
          >
            {(emailError || captchaError) && (
              <Alert
                message="Lỗi yêu cầu đặt lại mật khẩu"
                description={
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {emailError && <li>{emailError}</li>}
                    {captchaError && <li>{captchaError}</li>}
                  </ul>
                }
                type="error"
                showIcon
                style={{ marginBottom: '16px' }}
                closable
              />
            )}

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
              validateStatus={emailError ? 'error' : ''}
              help={emailError}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Email" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="captcha"
              rules={[{ required: true, message: 'Vui lòng nhập mã xác nhận!' }]}
              validateStatus={captchaError ? 'error' : ''}
              help={captchaError}
            >
              <Captcha 
                ref={captchaRef}
                value={captchaCode}
                onChange={(value) => {
                  setCaptchaCode(value);
                  if (captchaError) setCaptchaError('');
                }}
                onCaptchaChange={(newCaptcha) => setCaptchaCode(newCaptcha)}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="forgot-password-button"
                loading={loading}
                block
              >
                Gửi mã xác nhận
              </Button>
            </Form.Item>

            <div className="form-footer">
              <Button 
                type="link" 
                onClick={() => navigate('/login')}
                className="back-to-login"
              >
                Quay lại đăng nhập
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
