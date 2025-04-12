import React, { useState, useRef } from 'react';
import { Form, Input, Button, message, Card, Typography, Steps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, NumberOutlined } from '@ant-design/icons';
import { API_ENDPOINTS } from '../config/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Captcha, { CaptchaRef } from './Captcha';
import '../assets/styles/Register.css';

const { Title } = Typography;
const { Step } = Steps;

interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    phoneNumber: string;
    captcha: string;
    verificationCode: string;
}

const Register: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [captchaCode, setCaptchaCode] = useState('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
    const [captchaError, setCaptchaError] = useState<string>('');
    const [verificationError, setVerificationError] = useState<string>('');
    const [formData, setFormData] = useState<Partial<RegisterForm>>({});
    const captchaRef = useRef<CaptchaRef>(null);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [formStep2] = Form.useForm();

    const handleStep1 = async (values: Partial<RegisterForm>) => {
        try {
            console.log('Step 1 values:', values);
            setLoading(true);
            setEmailError('');
            setCaptchaError('');
            
            // Kiểm tra captcha
            if (values.captcha !== captchaCode) {
                setCaptchaError('Mã xác nhận không đúng!');
                if (captchaRef.current) {
                    captchaRef.current.refreshCaptcha();
                }
                setLoading(false);
                return;
            }

            // Gửi yêu cầu xác thực email
            await axios.post(API_ENDPOINTS.registerSendVerification, {
                email: values.email
            });

            setFormData(values);
            setCurrentStep(1);
            message.success('Mã xác nhận đã được gửi đến email của bạn!');
        } catch (error: any) {
            console.error('Step 1 error:', error);
            if (error.response?.data?.error === 'EMAIL_EXISTS') {
                setEmailError('Email đã được sử dụng');
            } else {
                message.error('Không thể gửi mã xác nhận. Vui lòng thử lại sau!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = async (values: RegisterForm) => {
        try {
            console.log('Step 2 values:', values);
            setLoading(true);
            setVerificationError('');
            setConfirmPasswordError('');
            setPasswordError('');
            
            // Kiểm tra mật khẩu không được chứa khoảng trắng
            if (values.password.includes(' ')) {
                setPasswordError('Mật khẩu không được chứa khoảng trắng!');
                setLoading(false);
                return;
            }

            // Kiểm tra mật khẩu xác nhận
            if (values.password !== values.confirmPassword) {
                setConfirmPasswordError('Mật khẩu xác nhận không khớp!');
                setLoading(false);
                return;
            }

            // Chuẩn hóa số điện thoại - thêm +84 vào trước
            const phoneNumber = '+84' + values.phoneNumber;

            console.log('Sending registration request with data:', {
                email: values.email,
                code: values.verificationCode,
                fullName: values.fullName,
                password: values.password,
                confirmPassword: values.confirmPassword,
                phoneNumber: phoneNumber,
                avatar: 'https://uploads3cnm.s3.us-east-1.amazonaws.com/avatar.png'
            });

            // Gửi yêu cầu xác thực đăng ký
            const response = await axios.post(API_ENDPOINTS.registerVerify, {
                email: values.email,
                code: values.verificationCode,
                fullName: values.fullName,
                password: values.password,
                confirmPassword: values.confirmPassword,
                phoneNumber: phoneNumber,
                avatar: 'https://uploads3cnm.s3.us-east-1.amazonaws.com/avatar.png'
            });

            console.log('Registration response:', response.data);
            message.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.response?.data?.error === 'INVALID_CODE') {
                setVerificationError('Mã xác nhận không chính xác');
            } else if (error.response?.data?.error === 'CODE_EXPIRED') {
                setVerificationError('Mã xác nhận đã hết hạn');
            } else if (error.response?.data?.error === 'PASSWORD_MISMATCH') {
                setConfirmPasswordError('Mật khẩu xác nhận không khớp!');
            } else if (error.response?.data?.error === 'PASSWORD_CONTAINS_SPACE') {
                setPasswordError('Mật khẩu không được chứa khoảng trắng!');
            } else if (error.response?.data?.error === 'PASSWORD_INVALID_FORMAT') {
                setPasswordError('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!');
            } else {
                message.error('Đăng ký thất bại. Vui lòng thử lại sau!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    const steps = [
        {
            title: 'Thông tin cơ bản',
            content: (
                <Form
                    form={form}
                    name="register-step1"
                    onFinish={handleStep1}
                    layout="vertical"
                    className="register-form"
                >
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
                            prefix={<MailOutlined className="input-icon" />} 
                            placeholder="Email" 
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

                    <div className="register-buttons">
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading} 
                            block
                            size="large"
                            className="register-button"
                        >
                            Tiếp tục
                        </Button>
                        <Button 
                            type="default" 
                            onClick={handleBackToLogin}
                            className="register-button-back-to-login"
                        >
                            Quay lại trang đăng nhập
                        </Button>
                    </div>
                </Form>
            ),
        },
        {
            title: 'Xác thực và hoàn tất',
            content: (
                <Form
                    form={formStep2}
                    name="register-step2"
                    onFinish={handleStep2}
                    layout="vertical"
                    className="register-form"
                    initialValues={formData}
                >
                    <Form.Item
                        name="email"
                        hidden
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="verificationCode"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã xác nhận!' },
                            { len: 6, message: 'Mã xác nhận phải có đúng 6 chữ số!' },
                            { pattern: /^[0-9]{6}$/, message: 'Mã xác nhận chỉ được chứa chữ số!' }
                        ]}
                        validateStatus={verificationError ? 'error' : ''}
                        help={verificationError}
                    >
                        <Input 
                            prefix={<NumberOutlined className="input-icon" />} 
                            placeholder="Mã xác nhận (6 chữ số)" 
                            size="large"
                            className="register-input"
                            maxLength={6}
                            onKeyPress={(e) => {
                                const charCode = e.which ? e.which : e.keyCode;
                                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="fullName"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ tên!' },
                            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input 
                            prefix={<UserOutlined className="input-icon" />} 
                            placeholder="Họ và tên" 
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
                                message: 'Số điện thoại không hợp lệ! (9 số, bắt đầu bằng 3, 5, 7, 8, 9)' 
                            }
                        ]}
                    >
                        <Input 
                            prefix={<>+84</>}
                            placeholder="Số điện thoại (VD: 912345678)" 
                            size="large"
                            className="register-input"
                            maxLength={9}
                            onKeyPress={(e) => {
                                const charCode = e.which ? e.which : e.keyCode;
                                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                            {
                                validator: (_, value) => {
                                    if (value && value.includes(' ')) {
                                        return Promise.reject('Mật khẩu không được chứa khoảng trắng!');
                                    }
                                    return Promise.resolve();
                                }
                            },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt!'
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const confirmPassword = formStep2.getFieldValue('confirmPassword');
                                    if (confirmPassword && value !== confirmPassword) {
                                        return Promise.reject('Mật khẩu và xác nhận mật khẩu không khớp!');
                                    }
                                    return Promise.resolve();
                                }
                            })
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="input-icon" />} 
                            placeholder="Mật khẩu (ít nhất 8 ký tự, bao gồm chữ hoa, thường, số và ký tự đặc biệt)" 
                            size="large"
                            className="register-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('Mật khẩu và xác nhận mật khẩu không khớp!');
                                },
                            }),
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="input-icon" />} 
                            placeholder="Xác nhận mật khẩu" 
                            size="large"
                            className="register-input"
                        />
                    </Form.Item>

                    <div className="register-buttons">
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading} 
                            block
                            size="large"
                            className="register-button"
                            onClick={() => {
                                console.log('Register button clicked');
                                formStep2.submit();
                            }}
                        >
                            Đăng ký
                        </Button>
                    </div>
                </Form>
            ),
        },
    ];

    return (
        <div className="register-container">
            <Card className="register-card">
                <div className="register-header">
                    <Title level={2} className="register-title">Zalo</Title>
                    <p className="register-subtitle">Đăng ký tài khoản mới</p>
                </div>

                <Steps current={currentStep} className="register-steps">
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>

                <div className="register-content">
                    {steps[currentStep].content}
                </div>
            </Card>
        </div>
    );
};

export default Register;
