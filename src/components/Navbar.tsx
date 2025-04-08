import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../assets/styles/Navbar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruck, faComments, faContactBook, faTools, faCloud } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
            <div className="container-main">
                <div className="header">
                    <div className="user-avatar">
                        <img className='img-user' src="/img/avt1.jpg" alt="icon-user" />
                    </div>
                    <div className="icons-info">
                        <Link to="/">
                            <div className="icon-chat">
                                <FontAwesomeIcon icon={faComments} />
                            </div>
                        </Link>
                        <Link to="/danh-sach">
                            <div className="icon-contact">
                                <FontAwesomeIcon icon={faContactBook} />
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="footer">
                        <div className="icon-cloud">
                            <FontAwesomeIcon icon={faCloud} />
                        </div>
                        <Link to="/cai-dat">
                            <div className="icon-setting">
                                <FontAwesomeIcon icon={faTools} />
                            </div>
                        </Link>
                        
                </div>
            </div>
    );
};

export default Navbar;