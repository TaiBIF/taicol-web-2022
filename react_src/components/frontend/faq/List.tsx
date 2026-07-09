import * as React from 'react';

import Item from './Item'
import { FaqDataProps, FaqListProps, CategoryDataProps } from '../types'
import useSWR from 'swr'
import { fetcher } from '../utils/helper'
import { Translation, useTranslation } from 'react-i18next';

const FaqList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectCategory] = React.useState<number | string>('all')
  const [keyword, setKeyword] = React.useState<string>('')
  const [searchInput, setSearchInput] = React.useState<string>('')
  const [page, setPage] = React.useState<number>(1)
  const [total, setTotal] = React.useState<number>(0) // total 代表總頁數
  const [pageList, setPageList] = React.useState<any[]>([])

  let lang_filter = '';
  if (i18n.language == 'en-us') {
    lang_filter = '&show_in_en=1'
  } else {
    lang_filter = '&show_in_zh=1'
  }

  const GET_FAQ_LIST_URL = `${process.env.REACT_API_URL}/api/faq?page=${page}&cid=${selectedCategory}&keyword=${encodeURIComponent(keyword)}${lang_filter}`;
  const GET_CATEGORY_LIST_URL = `${process.env.REACT_API_URL}/api/admin/category?type=faq`;
  const { data: faqList } = useSWR<FaqListProps>(GET_FAQ_LIST_URL, fetcher);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL, fetcher);
  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);

  React.useEffect(() => {
    if (faqList) {
      let window = 5
      let list_index = Math.ceil(page / window)
      let total_page = Math.ceil(faqList.count / pageSize)

      let page_list = [];
      let start = list_index * window - (window - 1);
      let step = 1;
      let stop;

      if (list_index * window > total_page) {
        stop = total_page + 1;
      } else {
        stop = list_index * window + 1;
      }

      page_list = Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
      setPageList(page_list)
      setTotal(total_page)
    }
  }, [faqList])

  const handleCategoryClick = (categoryId: string | number) => {
    setSelectCategory(categoryId)
    setPage(1)
  }

  const handleSearch = () => {
    setKeyword(searchInput.trim())
    setPage(1)
  }

  return (<div className="main-box vivi-cont-top padb-80">
    <div className="faq-search">
      <div className="cont-search-bar">
        <input
          type="text"
          placeholder={t('請輸入關鍵字') as string}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
        />
        <button className="search" onClick={handleSearch}>
          <svg xmlns="http://www.w3.org/2000/svg" width="36.847" height="36.775" viewBox="0 0 36.847 36.775">
            <path d="M0,15.8V13.791c.093-.611.172-1.224.282-1.832A14.8,14.8,0,0,1,11.626.36C12.373.206,13.135.118,13.89,0h1.943c.091.022.182.049.274.065.813.14,1.642.22,2.438.424a14.772,14.772,0,0,1,9.4,21.166c-.407.768-.9,1.489-1.4,2.3a2.517,2.517,0,0,1,.305.233q4.493,4.478,8.985,8.958a3.734,3.734,0,0,1,1.016,1.4v.718a2.258,2.258,0,0,1-.753,1.148,1.856,1.856,0,0,1-2.5-.29q-4.694-4.682-9.383-9.369A1.8,1.8,0,0,1,24,26.422c-.154.116-.212.156-.27.2A14.833,14.833,0,0,1,.359,17.991C.208,17.268.118,16.532,0,15.8m3.673-1.04A11.15,11.15,0,1,0,14.861,3.676,11.17,11.17,0,0,0,3.673,14.762" fill="#4c8da7"/>
          </svg>
        </button>
      </div>
    </div>

    <div className="cont-tab-area">
      <ul>
        <Translation>{t =>
          <li
            className={selectedCategory == 'all' ? 'now' : ''}
            onClick={() => handleCategoryClick('all')}>
            {t('全部')}
          </li>
        }</Translation>
        {categories?.map((category) => {
          return (
            <li
              key={`faq-cat-${category.id}`}
              onClick={() => handleCategoryClick(category.id)}
              className={selectedCategory === category.id ? 'now' : ''}>
              <p>{i18n.language == 'en-us' ? category.name_eng : category.name}</p>
            </li>
          )
        })}
      </ul>
    </div>

    <div className="faq-list">
      <ul>
        {faqList?.rows?.map((faq: FaqDataProps, index: number) => <Item {...faq} key={`faq-${index}`} />)}
      </ul>
    </div>

    <div className="page-num">
      {total > 0 ?
        <a onClick={() => setPage(1)} className="num">1</a> : ''
      }

      {total > 0 ?
        <>
          <a onClick={() => {
            if (page > 1)
              setPage(page - 1)
          }} className="back">
            <img src="/static/image/pagear1.svg" />
            <Translation>{t => <p>{t("上一頁")}</p>}</Translation>
          </a>
        </>
        : ''
      }

      {total > 0 &&
        Array.from(pageList).map((pageNumber: number) => {
          let link = <a onClick={() => setPage(pageNumber)} className={`num ${page == pageNumber ? 'now' : ''}`}>{pageNumber}</a>
          return link
        })
      }

      {total > 0 ?
        <>
          <a onClick={() => {
            if (page < total)
              setPage(page + 1)
          }} className="next">
            <Translation>{t => <p>{t("下一頁")}</p>}</Translation>
            <img src="/static/image/pagear2.svg" />
          </a>
        </>
        : ''
      }

      {total > 0 ?
        <a onClick={() => setPage(total)} className="num">{total}</a> : ''
      }
    </div>
  </div>
  )
}

export default FaqList