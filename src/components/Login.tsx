import React, { useState, useRef } from 'react';
import { Form, Input, Button, message, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthResponse, ErrorResponse } from '../types/api';
import Captcha, { CaptchaRef } from './Captcha';
import '../assets/styles/Login.css';

const { Title } = Typography;

interface LoginForm {
    identifier: string;
    password: string;
    captcha: string;
}

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [captchaCode, setCaptchaCode] = useState('');
    const [identifierError, setIdentifierError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [captchaError, setCaptchaError] = useState<string>('');
    const captchaRef = useRef<CaptchaRef>(null);
    const navigate = useNavigate();

    // Kiểm tra xem chuỗi nhập vào có phải là email hay không
    const isEmail = (input: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
    };

    // Kiểm tra xem chuỗi nhập vào có phải là số điện thoại hay không
    const isPhoneNumber = (input: string): boolean => {
        const phoneRegex = /^[3|5|7|8|9][0-9]{8}$/;
        return phoneRegex.test(input);
    };

    // Kiểm tra xem chuỗi nhập vào có phải là 9 chữ số không
    const isNineDigits = (input: string): boolean => {
        return /^[0-9]{9}$/.test(input);
    };

    const onFinish = async (values: LoginForm) => {
        // Kiểm tra captcha trước
        if (values.captcha !== captchaCode) {
            setCaptchaError('Mã xác nhận không đúng!');
            if (captchaRef.current) {
                captchaRef.current.refreshCaptcha();
            }
            return; // Dừng lại không tiếp tục xử lý đăng nhập
        }

        try {
            setLoading(true);
            setIdentifierError('');
            setPasswordError('');
            setCaptchaError('');
            
            let loginData = {};
            
            // Kiểm tra định dạng đầu vào và xử lý phù hợp
            if (isEmail(values.identifier)) {
                // Đăng nhập với email
                loginData = {
                    email: values.identifier,
                    password: values.password
                };
            } else if (isPhoneNumber(values.identifier)) {
                // Đăng nhập với số điện thoại, thêm +84 vào trước
                const formattedPhone = '+84' + values.identifier;
                loginData = {
                    phoneNumber: formattedPhone,
                    password: values.password
                };
            } else {
                setIdentifierError('Vui lòng nhập email hợp lệ hoặc 9 chữ số điện thoại (không bao gồm số 0 đầu)');
                setLoading(false);
                return;
            }
            
            const response = await axios.post<AuthResponse>(API_ENDPOINTS.login, loginData);
            
            message.success('Đăng nhập thành công!');
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/user/home');
        } catch (error: any) {
            const errorResponse = error.response?.data as ErrorResponse;
            if (error.response?.data?.error === 'EMAIL_NOT_FOUND' || error.response?.data?.error === 'PHONE_NOT_FOUND') {
                setIdentifierError('Tài khoản không tồn tại trong hệ thống');
            } else if (error.response?.data?.error === 'INVALID_PASSWORD') {
                setPasswordError('Mật khẩu không chính xác');
            } else if (error.response?.data?.error === 'PASSWORD_TOO_SHORT') {
                setPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
            } else {
                message.error(errorResponse?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <div className="login-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        marginBottom: '8px'
                    }}>
                        <Title level={2} className="login-title" style={{ margin: 0, color: '#0068ff' }}>Zalo</Title>
                    </div>
                    <p className="login-subtitle" style={{ color: '#666', fontSize: '16px' }}>Đăng nhập tài khoản Zalo<br />để kết nối với ứng dụng Zalo Web</p>
                </div>

                <Form<LoginForm>
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    className="login-form"
                >
                    <Form.Item
                        name="identifier"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email hoặc số điện thoại!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    if (isEmail(value)) {
                                        return Promise.resolve();
                                    }
                                    if (isPhoneNumber(value)) {
                                        return Promise.resolve();
                                    }
                                    if (isNineDigits(value)) {
                                        return Promise.reject(new Error('Số điện thoại phải bắt đầu bằng 3, 5, 7, 8 hoặc 9 (không bao gồm số 0 đầu)'));
                                    }
                                    return Promise.reject(new Error('Vui lòng nhập email hợp lệ hoặc 9 chữ số điện thoại'));
                                },
                            }),
                        ]}
                        validateStatus={identifierError ? 'error' : ''}
                    >
                        <Input 
                            prefix={<UserOutlined className="input-icon" />} 
                            placeholder="Email hoặc số điện thoại" 
                            size="large"
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                        ]}
                        validateStatus={passwordError ? 'error' : ''}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="input-icon" />} 
                            placeholder="Mật khẩu" 
                            size="large"
                            className="login-input"
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

                    {(identifierError || passwordError || captchaError) && (
                        <Alert
                            message="Lỗi đăng nhập"
                            description={
                                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                    {identifierError && <li>{identifierError}</li>}
                                    {passwordError && <li>{passwordError}</li>}
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
                            className="login-form-button"
                            loading={loading}
                            block
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <div className="login-footer" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center'
                    }}>
                        <Button 
                            type="link" 
                            onClick={() => navigate('/forgot-password')}
                            className="forgot-password-link"
                            style={{ padding: '4px 0', height: 'auto', margin: 0 }}
                        >
                            Quên mật khẩu?
                        </Button>
                        <Button 
                            type="link" 
                            onClick={() => navigate('/register')}
                            className="register-link"
                            style={{ padding: '4px 0', height: 'auto', margin: 0 }}
                        >
                            Đăng ký tài khoản mới
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
