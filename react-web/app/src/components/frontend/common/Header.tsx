import React from 'react';
import MainNav from './MainNav'

const Header: React.VFC = () => {

  return (
    <div className="header">
        <div className="header-content">
            <div className="mb-hambruger">
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
                <MainNav/>
            </div>
        </div>
    </div>
  )
}

export default Header
