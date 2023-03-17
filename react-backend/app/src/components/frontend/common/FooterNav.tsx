import React from 'react';

type Menu = {
  title: string,
  href?: string,
  target?: string,
  children?: Menu[]
}

type MenuLink = {
  key: string,
  menu:Menu
}

const menusCol1:Menu[] = [
  {
    title: '關於TaiCOL',
    href: '/about'
  },
  {
    title: '物種樹',
    href: 'http://web-staging.taicol.tw/taxon/tree'
  },
  {
    title: '物種名錄',
    href: '/catalogue?filter=1'
  },
]

const menusCol2:Menu[] = [
  {
    title: '資料工具',
    children: [
      {
        title: '資料下載',
        href: '/download'
      },
      {
        title: 'API',
        href: '/apidoc'
      },
      {
        title: '學名比對工具',
        href: '/name/match'
      },
      {
        title: '學名管理工具',
        href: 'https://nametool.taicol.tw/',
        target: '_blank'
      },
    ]
  },
]

const menusCol3:Menu[] = [
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

const GerenateMenuLink:React.VFC<MenuLink> = (props) => {
  const { menu } = props;

  return menu?.children ?
    <>
    <a href="#" className="bit-title disabled-a-link">
        <span></span>
        <p>{menu.title}</p>
    </a>
    {menu?.children?.map((menu: Menu, index: number) => <a key={`submenu-${index}`} href={menu.href} className="ss-title" target={menu.target}>
            <p>{menu.title}</p>
    </a>)}
    </> :
    <a  href={menu.href} className="bit-title" target={menu.target}>
        <span></span>
        <p>{menu.title}</p>
    </a>
}

const MainNav: React.VFC = () => {

  return (

    <ul className="site-map">
      <li>
        {menusCol1?.map((menu: Menu, index: number) => <GerenateMenuLink menu={menu}  key={`footer-col1-menu-${index}`}/>)}
      </li>
      <li>
        {menusCol2?.map((menu: Menu, index: number) => <GerenateMenuLink menu={menu}  key={`footer-col1-menu-${index}`}/>)}
      </li>
      <li>
        {menusCol3?.map((menu: Menu, index: number) => <GerenateMenuLink menu={menu}  key={`footer-col1-menu-${index}`}/>)}
      </li>
    </ul>

  )
}

export default MainNav
