import '../../../assets/styles/FriendLayout.css';
import { UsergroupAddOutlined, UserAddOutlined, EllipsisOutlined, MoreOutlined, VideoCameraOutlined, MenuFoldOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch} from "@fortawesome/free-solid-svg-icons";
import { Link, Outlet } from 'react-router-dom';

const FriendLayout = () => {
    return(
        <div className="friend-layout">
            <div className="left-section">
                <div className="search-section">
                    <div className="search-input">
                        <FontAwesomeIcon icon={faSearch} />
                        <input type="text" placeholder="Tìm kiếm" />
                    </div>
                    <div className="icon-section">
                        <UserAddOutlined className="icon-adduser"/>
                        <UsergroupAddOutlined className="icon-addgroup"/>
                    </div>         
                </div>
                <div className='menu-contact'>
                    <Link to="danh-sach-ban-be">
                        <div className='menu-item'>
                            <UserAddOutlined className="icon-adduser"/>
                            <p className='menu-item-name'>Danh sách bạn bè</p>
                        </div>
                    </Link>
                    <Link to="danh-sach-nhom">
                        <div className='menu-item'>
                            <UserAddOutlined className="icon-adduser"/>
                            <p className='menu-item-name'>Danh sách nhóm</p>
                        </div>
                    </Link>
                    <Link to="danh-sach-loi-moi-ket-ban">
                        <div className='menu-item'>
                            <UserAddOutlined className="icon-adduser"/>
                            <p className='menu-item-name'>Lời mời kết bạn</p>
                        </div>
                    </Link>
                    <Link to="danh-sach-loi-moi-vao-nhom">
                        <div className='menu-item'>
                            <UserAddOutlined className="icon-adduser"/>
                            <p className='menu-item-name'>Lời mời vào nhóm</p>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="right-section">
                <Outlet />
            </div>
        </div>
    )
};

export default FriendLayout;