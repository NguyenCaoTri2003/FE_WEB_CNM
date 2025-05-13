// import {UserAddOutlined, EllipsisOutlined} from "@ant-design/icons";
// import { faSearch} from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import '../../../../assets/styles/GroupList.css';

// import { Dropdown, MenuProps } from "antd";

// const handleMenuClick: MenuProps["onClick"] = (e) => {
//     if (e.key === "leave") {
//       console.log("Người dùng chọn rời nhóm");
//     } else if (e.key === "categorize") {
//       console.log("Người dùng chọn phân loại");
//     }
//   };
  
//   const items: MenuProps["items"] = [
//     { key: "leave", label: "Rời nhóm" },
//     { key: "categorize", label: "Phân loại" },
//   ];


// const GroupList = () => {
//     return (
//         <div className="contact-page">
//             <div className='head-page-contact'>
//                 <UserAddOutlined className="icon-adduser"/>
//                 <p className='menu-item-name'>Danh sách nhóm</p>   
//             </div>
            
//             <div className="card-list-wapper">
//                 <p className="text-head-page-contact">Nhóm (23)</p>
//                 <div className="backgroud-list">
//                     <div className="filter">
//                         <div className="sreach">
//                             <FontAwesomeIcon icon={faSearch} className="search-icon"/>
//                             <input type="text" placeholder="Tìm kiếm..." />
//                         </div>
//                         <div className="filter-contact">
//                             <div className="sort">
//                                 <select id="sort1">
//                                     <option value="az">A-Z</option>
//                                     <option value="za">Z-A</option>
//                                 </select>
//                             </div>
//                             <div className="sort">
//                                 <select id="sort2">
//                                     <option value="az">Phân loại</option>
//                                     <option value="za">Z-A</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>
//                     {/*  */}
//                     <div className="list-item">
//                         <div className="item-wapper">
//                             <div className="img-size">
//                                 sx
//                             </div>
//                             <div className="info-item">
//                                 <div>
//                                     <p className="name-item">Nhóm 1</p>
//                                     <p className="zise-item">6 thành viên</p>
//                                 </div>
//                                 <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
//                                     <EllipsisOutlined style={{ cursor: "pointer", fontSize: 18 }} />
//                                 </Dropdown>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// };

// export default GroupList;

import React, { useState, useEffect } from "react";
import { Search, ChevronDown, MoreHorizontal } from "lucide-react";
import "../../../../assets/styles/GroupList.css";
import { API_ENDPOINTS } from "config/api";
import axios from "axios";

interface Group {
    email: string;
    groupId: string;
    name: string;
    avatar: string; 
}

interface GroupResponse {
    success: boolean;
    data: Group[];
    message?: string;
}

const GroupList = () => {
    const [groups, setGroups] = useState<Group[]>([]); // hoặc define rõ type sau cũng được
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
          try {
            const token = localStorage.getItem('token'); // Lấy token từ localStorage
            const response = await axios.get<GroupResponse>(API_ENDPOINTS.getGroups, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
    
            if (response.data.success) {
              setGroups(response.data.data); // Cập nhật state nhóm
            } else {
              console.error('Error fetching groups:', response.data.message);
            }
          } catch (error) {
            console.error('Error fetching groups:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchGroups();
    }, []);
    
    if (loading) {
      return (
        <div className='spinnerContainer'>
          <div className='spinner'></div>
          <p>Vui lòng đợi trong giây lát...</p>
        </div>
      );
    }

    return (
        <div className="contact-page">
        <div className="header-group">
            <h1>Danh sách nhóm</h1>
        </div>

        <div className="content-wrapper">
            <div className="group-count">
            <h2>Nhóm (số lượng)</h2>
            </div>

            <div className="search-filter-container">
            <div className="search-container">
                <Search className="search-icon" />
                <input
                type="text"
                placeholder="Tìm bạn"
                className="search-input-group"
                style={{ textIndent: "24px" }}
                />
            </div>
            <div className="filter-buttons">
                <button className="filter-button">
                <span>Tên (A-Z)</span>
                <ChevronDown className="filter-icon" />
                </button>
                <button className="filter-button">
                <span>Tất cả</span>
                <ChevronDown className="filter-icon" />
                </button>
            </div>
            </div>

            <div className="group-list">
            
                <div className="group-group">
                    {groups.map((group) => (
                        <div key={group.groupId} className="group-item">
                        <div className="group-info">
                            <div
                            className="group-avatar"
                            style={{ backgroundColor: "#ffffff", color: "#000000", border: "1px solid #e5e7eb" }}
                            >
                            <img
                                src={group.avatar || "https://via.placeholder.com/150"} // Nếu sau này muốn ảnh nhóm thì sửa src
                                className="avatar-image"
                            />
                            </div>
                            <span className="group-name">{group.name}</span> {/* Hiển thị tên nhóm */}
                        </div>
                        <button className="more-button">
                            <MoreHorizontal className="more-icon" />
                        </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
        </div>
    );
};

export default GroupList;
