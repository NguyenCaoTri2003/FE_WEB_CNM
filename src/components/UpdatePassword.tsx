import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, message, Card } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import '../assets/styles/UpdatePassword.css';

const { Title } = Typography;

interface UpdatePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UpdatePassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const onFinish = async (values: UpdatePasswordForm) => {
    const { currentPassword, newPassword, confirmPassword } = values;

    const errors: string[] = [];

    if (!currentPassword || !newPassword || !confirmPassword) {
      errors.push('Vui lòng nhập đầy đủ thông tin!');
    }

    if (newPassword !== confirmPassword) {
      errors.push('Mật khẩu mới không khớp!');
    }

    if (newPassword.length < 6) {
      errors.push('Mật khẩu mới phải có ít nhất 6 ký tự!');
    }
    if (/\s/.test(newPassword)) {
      errors.push('Mật khẩu mới không được chứa khoảng trắng!');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setFormErrors([]);

      const token = localStorage.getItem('token');

      await axios.put(
        API_ENDPOINTS.updatePassword,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success('Cập nhật mật khẩu thành công!');
      navigate('/user/home');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Lỗi khi cập nhật mật khẩu!';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-password-container">
      <Card className="update-password-card">
        <Title level={2} className="update-password-title">
          Cập nhật mật khẩu
        </Title>

        {formErrors.length > 0 && (
          <Alert
            message="Lỗi khi cập nhật mật khẩu"
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {formErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form<UpdatePasswordForm>
          name="update-password"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
          </Form.Item>

          <Form.Item
            label="Nhập lại mật khẩu mới"
            name="confirmPassword"
            // rules={[{ required: true, message: 'Vui lòng nhập lại mật khẩu mới!' }]}
            rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                    }
                    return Promise.reject(new Error('Xác nhận mật khẩu không khớp!'));
                    },
                })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="update-password-button"
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdatePassword;
