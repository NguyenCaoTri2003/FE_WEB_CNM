import React, { useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Input } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface CaptchaProps {
    value?: string;
    onChange?: (value: string) => void;
    onCaptchaChange?: (captcha: string) => void;
}

export interface CaptchaRef {
    refreshCaptcha: () => void;
}

const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    return captcha;
};

const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({ value, onChange, onCaptchaChange }, ref) => {
    const [captchaCode, setCaptchaCode] = useState(generateCaptcha());

    // Thông báo cho component cha về mã captcha mới khi component được tạo
    useEffect(() => {
        onCaptchaChange?.(captchaCode);
    }, [captchaCode, onCaptchaChange]);

    const refreshCaptcha = useCallback(() => {
        const newCaptcha = generateCaptcha();
        setCaptchaCode(newCaptcha);
        onChange?.('');
    }, [onChange]);

    // Expose the refreshCaptcha function to parent components
    useImperativeHandle(ref, () => ({
        refreshCaptcha
    }));

    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'stretch',
            height: '48px'
        }}>
            <Input
                placeholder="Nhập mã xác nhận"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                style={{ 
                    flexGrow: 1,
                    height: '48px',
                    fontSize: '16px',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                }}
                className="captcha-input"
            />
            <div 
                style={{ 
                    background: '#f0f0f0', 
                    padding: '0 16px', 
                    borderRadius: '0 4px 4px 0',
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    letterSpacing: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '48px',
                    minWidth: '100px'
                }}
                onClick={refreshCaptcha}
            >
                {captchaCode}
                <ReloadOutlined style={{ marginLeft: '8px' }} />
            </div>
        </div>
    );
});

export default Captcha; 