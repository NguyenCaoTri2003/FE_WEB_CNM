import React from 'react';
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import { UsergroupAddOutlined, UserAddOutlined, CloseOutlined} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../assets/styles/SearchNavbar.css";
import axios from "axios";
import { API_ENDPOINTS } from '../config/api';

interface SearchUserResponse {
    success: boolean;
    data: {
        fullName: string;
        avatar: string;
        phoneNumber: string;
        email: string;
    };
}

const SearchNavbar: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            try {
                const response = await axios.get<SearchUserResponse>(API_ENDPOINTS.search, {
                    params: {
                        email: searchTerm.trim()
                    }
                });

                if (response.data?.data) {
                    const newUser = response.data.data;
                    const alreadyExists = searchedUsers.some(u => u.email === newUser.email);
                    if (!alreadyExists) {
                        setSearchedUsers(prev => [newUser, ...prev]);
                    }
                    setSearchTerm('');
                }
            } catch (err) {
                console.error("Tìm không thấy người dùng hoặc lỗi server", err);
            }
        }
    };

    const handleUserClick = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleRemoveUser = (email: string) => {
        setSearchedUsers(prev => prev.filter(user => user.email !== email));
    };

    return (
        <div className="container-search">
            <div className="search-section">
                <div className="search-input">
                    <FontAwesomeIcon icon={faSearch} />
                    <input 
                        type="text"
                        placeholder="Tìm kiếm" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                <div className="icon-section">
                    <UserAddOutlined className="icon-adduser"/>
                    <UsergroupAddOutlined className="icon-addgroup"/>
                </div>         
            </div>
            {/* Hiển thị danh sách người dùng tìm kiếm */}
            {searchedUsers.length > 0 && (
                <div className="user-search">
                    <div className="title-search">
                        <p>Tìm gần đây</p>
                    </div>
                    <div className="list-search">
                        {searchedUsers.map((user) => (
                            <div key={user.email} className="user-item" onClick={() => handleUserClick(user)}>
                                <div className="info-user">
                                    <img src={user.avatar} alt="User" />
                                    <div className="user-name">{user.fullName}</div>
                                </div>
                                <CloseOutlined className="icon-close" onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveUser(user.email);
                                }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal hiển thị thông tin chi tiết */}
            {selectedUser && (
                <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal} className="user-modal" overlayClassName="overlay">
                    <div className="modal-content">
                        <h2>Thông tin người dùng</h2>
                        <img src={selectedUser.avatar} alt="Avatar" style={{ width: 100, borderRadius: '50%' }} />
                        <p><strong>Tên:</strong> {selectedUser.fullName}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>SĐT:</strong> {selectedUser.phoneNumber}</p>
                        <button onClick={handleCloseModal}>Đóng</button>
                    </div>
                </Modal>
            )}

        </div>
    );

};

export default SearchNavbar;