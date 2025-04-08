import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { LockOutlined, MailOutlined, NumberOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import '../assets/styles/ResetPassword.css';

const { Title } = Typography;

interface ResetPasswordForm {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

interface LocationState {
  email?: string;
}

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    // Nếu có email từ trang quên mật khẩu, điền vào form
    if (state?.email) {
      form.setFieldsValue({ email: state.email });
    }
  }, [state, form]);

  const onFinish = async (values: ResetPasswordForm) => {
    try {
      setLoading(true);
      setEmailError('');
      setCodeError('');
      setPasswordError('');
      
      // Kiểm tra mật khẩu và xác nhận mật khẩu khớp nhau
      if (values.password !== values.confirmPassword) {
        setPasswordError('Xác nhận mật khẩu không khớp');
        setLoading(false);
        return;
      }
      
      // Gửi yêu cầu đặt lại mật khẩu
      await axios.post(API_ENDPOINTS.resetPassword, {
        email: values.email,
        code: values.code,
        newPassword: values.password
      });
      
      // Hiển thị thông báo thành công
      setResetSuccess(true);
      message.success('Mật khẩu đã được đặt lại thành công!');
    } catch (error: any) {
      if (error.response?.data?.error === 'EMAIL_NOT_FOUND') {
        setEmailError('Email không tồn tại trong hệ thống');
      } else if (error.response?.data?.error === 'INVALID_CODE') {
        setCodeError('Mã xác nhận không chính xác');
      } else if (error.response?.data?.error === 'CODE_EXPIRED') {
        setCodeError('Mã xác nhận đã hết hạn');
      } else if (error.response?.data?.error === 'PASSWORD_TOO_SHORT') {
        setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      } else {
        message.error('Không thể đặt lại mật khẩu. Vui lòng thử lại sau!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <Card className="reset-password-card">
        <div className="reset-password-header">
          <Title level={2} className="reset-password-title">Zalo</Title>
          <p className="reset-password-subtitle">Đặt lại mật khẩu</p>
        </div>

        {resetSuccess ? (
          <div className="reset-success">
            <Alert
              message="Mật khẩu đã được đặt lại"
              description="Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
              type="success"
              showIcon
            />
            <Button 
              type="primary" 
              block 
              onClick={() => navigate('/login')}
              style={{ marginTop: '20px' }}
            >
              Đăng nhập
            </Button>
          </div>
        ) : (
          <Form<ResetPasswordForm>
            name="reset-password"
            onFinish={onFinish}
            layout="vertical"
            className="reset-password-form"
            form={form}
          >
            {(emailError || codeError || passwordError) && (
              <Alert
                message="Lỗi đặt lại mật khẩu"
                description={
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {emailError && <li>{emailError}</li>}
                    {codeError && <li>{codeError}</li>}
                    {passwordError && <li>{passwordError}</li>}
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
              name="code"
              rules={[
                { required: true, message: 'Vui lòng nhập mã xác nhận!' },
                { len: 6, message: 'Mã xác nhận phải có 6 chữ số!' }
              ]}
              validateStatus={codeError ? 'error' : ''}
              help={codeError}
            >
              <Input 
                prefix={<NumberOutlined />} 
                placeholder="Mã xác nhận (6 chữ số)" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
              validateStatus={passwordError ? 'error' : ''}
              help={passwordError}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Mật khẩu mới" 
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Xác nhận mật khẩu không khớp!'));
                  },
                })
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Xác nhận mật khẩu" 
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="reset-password-button"
                loading={loading}
                block
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>

            <div className="reset-password-footer">
              <Button 
                type="link" 
                onClick={() => navigate('/forgot-password')}
                className="resend-code"
              >
                Gửi lại mã xác nhận
              </Button>
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

export default ResetPassword; 