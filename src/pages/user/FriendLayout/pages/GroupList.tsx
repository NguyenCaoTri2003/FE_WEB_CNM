import { UsergroupAddOutlined, UserAddOutlined, EllipsisOutlined, MoreOutlined, VideoCameraOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { faSearch} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '../../../../assets/styles/GroupList.css';



import { Dropdown, Menu, MenuProps } from "antd";

const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "leave") {
      console.log("Người dùng chọn rời nhóm");
    } else if (e.key === "categorize") {
      console.log("Người dùng chọn phân loại");
    }
  };
  
  const items: MenuProps["items"] = [
    { key: "leave", label: "Rời nhóm" },
    { key: "categorize", label: "Phân loại" },
  ];


const GroupList = () => {
    return (
        <div className="contact-page">
            <div className='head-page-contact'>
                <UserAddOutlined className="icon-adduser"/>
                <p className='menu-item-name'>Danh sách nhóm</p>   
            </div>
            
            <div className="card-list-wapper">
                <p className="text-head-page-contact">Nhóm (23)</p>
                <div className="backgroud-list">
                    <div className="filter">
                        <div className="sreach">
                            <FontAwesomeIcon icon={faSearch} className="search-icon"/>
                            <input type="text" placeholder="Tìm kiếm..." />
                        </div>
                        <div className="filter-contact">
                            <div className="sort">
                                <select id="sort1">
                                    <option value="az">A-Z</option>
                                    <option value="za">Z-A</option>
                                </select>
                            </div>
                            <div className="sort">
                                <select id="sort2">
                                    <option value="az">Phân loại</option>
                                    <option value="za">Z-A</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/*  */}
                    <div className="list-item">
                        <div className="item-wapper">
                            <div className="img-size">
                                sx
                            </div>
                            <div className="info-item">
                                <div>
                                    <p className="name-item">Nhóm 1</p>
                                    <p className="zise-item">6 thành viên</p>
                                </div>
                                <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={["click"]}>
                                    <EllipsisOutlined style={{ cursor: "pointer", fontSize: 18 }} />
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default GroupList;