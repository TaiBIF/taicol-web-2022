import * as React from 'react';
import { isTablet,isMobile,isDesktop } from 'react-device-detect';

type Menu = {
  title: string,
  href?: string,
  target?: string,
  children?: Menu[]
}

const menus:Menu[] = [
  {
    title: '關於TaiCOL',
    href: '/about'
  },
  {
    title: '物種樹',
    href: '/taxon/tree'
  },
  {
    title: '物種名錄',
    href: '/catalogue'
  },
  {
    title: '資料工具',
    children: [
      {
        title: '資料下載',
        href: '/download'
      },
      {
        title: 'API',
        href: '${process.env.REACT_API_URL}/apidoc'
      },
      {
        title: '學名比對工具',
        href: '/name/match'
      },
      {
        title: '學名管理工具',
        href: 'https://nametool.taicol.tw/zh-tw/',
        target: '_blank'
      },
    ]
  },
  {
    title: '更多資訊',
    children: [
      {
        title: '最新消息',
        href: '/news'
      },
      {
        title: '主題文章',
        href: '/article'
      },
      {
        title: '資料統計',
        href: '/statistics'
      },
      {
        title: '資料使用規範',
        href: '/policy'
      },
    ]
  },
]

const MainNav: React.FC = () => {

  return (

    <ul className={isDesktop ? "main_menu flex" : "main_menu block"}>
      {menus?.map((menu: Menu, index: number) => {
          return menu?.children ? <li className="mbli" key={`main-menu-${index}`}>
            <p className="big_title">
              {menu.title}
              <span></span>
            </p>
            <div className="menu_2">
              <div className="w_bg">
                {menu?.children?.map((menu: Menu, index: number) =>
                  <a target={menu.target} href={menu.href} key={`main-sub-menu-${index}`}>{menu.title}<span></span></a>

                )}
              </div>
            </div>
          </li> :
          <li key={`main-menu-${index}`}>
              <a target={menu.target} href={menu.href} className="big_title">{menu.title}<span></span></a>
          </li>
      })}
    </ul>

  )
}

export default MainNav
