import React, { useState, useRef } from 'react';
import { Form, Input, Button, message, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ErrorResponse } from '../types/api';
import Captcha, { CaptchaRef } from './Captcha';
import '../assets/styles/Register.css';

const { Title } = Typography;

interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phoneNumber: string;
    captcha: string;
}

const Register: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [captchaCode, setCaptchaCode] = useState('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
    const [captchaError, setCaptchaError] = useState<string>('');
    const captchaRef = useRef<CaptchaRef>(null);
    const navigate = useNavigate();

    const onFinish = async (values: RegisterForm) => {
        // Kiểm tra mật khẩu xác nhận
        if (values.password !== values.confirmPassword) {
            setConfirmPasswordError('Mật khẩu xác nhận không khớp!');
            return;
        }

        // Kiểm tra captcha
        if (values.captcha !== captchaCode) {
            setCaptchaError('Mã xác nhận không đúng!');
            if (captchaRef.current) {
                captchaRef.current.refreshCaptcha();
            }
            return;
        }

        // Chuẩn hóa số điện thoại - thêm +84 vào trước
        const phoneNumber = '+84' + values.phoneNumber;

        try {
            setLoading(true);
            setEmailError('');
            setPasswordError('');
            setConfirmPasswordError('');
            setCaptchaError('');
            
            console.log('Sending registration data:', {
                email: values.email,
                fullName: values.fullName,
                phoneNumber: phoneNumber
            });
            
            const response = await axios.post(API_ENDPOINTS.register, {
                email: values.email,
                password: values.password,
                fullName: values.fullName,
                phoneNumber: phoneNumber
            });
            
            console.log('Registration response:', response.data);
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error: any) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response?.data);
            const errorResponse = error.response?.data as ErrorResponse;
            
            if (error.response?.data?.error === 'EMAIL_EXISTS') {
                setEmailError('Email đã được sử dụng');
            } else if (error.response?.data?.error === 'PASSWORD_TOO_SHORT') {
                setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
            } else {
                message.error(errorResponse?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin và thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <Card className="register-card">
                <div className="register-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        marginBottom: '8px'
                    }}>
                        <Title level={2} className="register-title" style={{ margin: 0, color: '#0068ff' }}>Zalo</Title>
                    </div>
                    <p className="register-subtitle" style={{ color: '#666', fontSize: '16px' }}>
                        Đăng ký tài khoản Zalo<br />
                        <span>để kết nối với ứng dụng Zalo Web</span>
                    </p>
                </div>

                <Form<RegisterForm>
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    className="register-form"
                >
                    <Form.Item
                        name="fullName"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input 
                            prefix={<UserOutlined className="input-icon" />} 
                            placeholder="Họ và tên" 
                            size="large"
                            className="register-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                        validateStatus={emailError ? 'error' : ''}
                    >
                        <Input 
                            prefix={<MailOutlined className="input-icon" />} 
                            placeholder="Email" 
                            size="large"
                            className="register-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { 
                                pattern: /^[3|5|7|8|9][0-9]{8}$/,
                                message: 'Vui lòng nhập 9 chữ số (không bao gồm số 0 đầu)' 
                            }
                        ]}
                    >
                        <Input 
                            addonBefore="+84"
                            prefix={<PhoneOutlined className="input-icon" />} 
                            placeholder="Số điện thoại" 
                            size="large"
                            className="register-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                        validateStatus={passwordError ? 'error' : ''}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="input-icon" />} 
                            placeholder="Mật khẩu" 
                            size="large"
                            className="register-input"
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
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                        validateStatus={confirmPasswordError ? 'error' : ''}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="input-icon" />} 
                            placeholder="Xác nhận mật khẩu" 
                            size="large"
                            className="register-input"
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

                    {(emailError || passwordError || confirmPasswordError || captchaError) && (
                        <Alert
                            message="Lỗi đăng ký"
                            description={
                                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                    {emailError && <li>{emailError}</li>}
                                    {passwordError && <li>{passwordError}</li>}
                                    {confirmPasswordError && <li>{confirmPasswordError}</li>}
                                    {captchaError && <li>{captchaError}</li>}
                                </ul>
                            }
                            type="error"
                            showIcon
                            style={{ marginBottom: '16px' }}
                            closable
                        />
                    )}

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading} 
                            block
                            size="large"
                            className="register-button"
                        >
                            Đăng ký
                        </Button>
                    </Form.Item>

                    <div className="register-footer">
                        <Button type="link" onClick={() => navigate('/login')}>
                            Đã có tài khoản? Đăng nhập
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
