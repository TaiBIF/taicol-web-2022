import React,{useState} from 'react';
import MainNav from './MainNav'
import { isTablet,isMobile,isDesktop } from 'react-device-detect';

const Header: React.VFC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  console.log(isTablet)
  console.log(isMobile)
  console.log(isMenuOpen)
  console.log((isTablet || isMobile) && isMenuOpen)
  const onHamburgerClick = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="header">
        <div className="header-content">
            <div className="mb-hambruger" onClick={onHamburgerClick}>
                <svg className="ham hamRotate ham4" viewBox="0 0 100 100" width="60">
                    <path className="line top" d="m 70,33 h -40 c 0,0 -8.5,-0.149796 -8.5,8.5 0,8.649796 8.5,8.5 8.5,8.5 h 20 v -20"></path>
                    <path className="line middle" d="m 70,50 h -40"></path>
                    <path className="line bottom" d="m 30,67 h 40 c 0,0 8.5,0.149796 8.5,-8.5 0,-8.649796 -8.5,-8.5 -8.5,-8.5 h -20 v 20"></path>
                </svg>
            </div>
            <div className="flex-box">
                <a href="/" className="logo">
                    <img src="/images/logo.svg" alt="臺灣物種名錄" />
                </a>
              {((isTablet || isMobile) && isMenuOpen || isDesktop) && <MainNav />}
            </div>
        </div>
    </div>
  )
}

export default Header
