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
            <div className="container">
                <div className="header">
                    <div className="user-avatar">
                        <img className='img-user' src="/img/avt1.jpg" alt="icon-login" />
                    </div>
                    <div className="icons-info">
                        <div className="icon-chat">
                            <FontAwesomeIcon icon={faComments} />
                        </div>
                        <div className="icon-contact">
                            <FontAwesomeIcon icon={faContactBook} />
                        </div>
                    </div>
                </div>
                <div className="footer">
                        <div className="icon-cloud">
                            <FontAwesomeIcon icon={faCloud} />
                        </div>
                        <div className="icon-setting">
                            <FontAwesomeIcon icon={faTools} />
                        </div>
                </div>
            </div>
    );
};

export default Navbar;