import * as React from 'react';

import Item from './Item'
import { NewsDataProps, NewsListProps, CategoryDataProps } from '../types'
import useSWR from 'swr'
import { fetcher } from '../utils/helper'
import { Translation, useTranslation } from 'react-i18next';
import { link } from 'fs/promises';

const NewsItem: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectCategory] = React.useState<number | string>('all')
  const [page, setPage] = React.useState<number>(1)
  const [total, setTotal] = React.useState<number>(0) // total 代表總頁數
  const [pageList, setPageList] = React.useState<any[]>([])

  let lang_filter = '';
  if (i18n.language == 'en-us') {
    lang_filter = '&show_in_en=1'
  } else {
    lang_filter = '&show_in_zh=1'
  }

  const GET_NEWS_LIST_URL = `${process.env.REACT_API_URL}/api/news?page=${page}&cid=${selectedCategory}${lang_filter}`;
  const GET_CATEGORY_LIST_URL = `${process.env.REACT_API_URL}/api/admin/category?type=news`;
  const { data: newsList } = useSWR<NewsListProps>(GET_NEWS_LIST_URL, fetcher);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL, fetcher);
  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);


  React.useEffect(() => {
    if (newsList) {

      let window = 5
      let list_index = Math.ceil(page / window)
      let total_page = Math.ceil(newsList.count / pageSize)

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
  }, [newsList])

  const handleCategoryClick = (categoryId: string | number) => {
    setSelectCategory(categoryId)
    setPage(1)
  }

  return (<div className="main-box vivi-cont-top padb-80">
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
              onClick={() => handleCategoryClick(category.id)}
              className={selectedCategory === category.id ? 'now' : ''}>
              <p>{i18n.language == 'en-us' ? category.name_eng : category.name}</p>
            </li>
          )
        })}
      </ul>
    </div>
    <div className="news-area-cont">
      <div className="news-list-box">
        <ul>
          {newsList?.rows?.map((news: NewsDataProps, index: number) => <Item {...news} key={`news-${index}`} />)}
        </ul>
      </div>

    </div>
    <div className="page-num">

      { total > 0 ?
        <a onClick={() => setPage(1)} className="num">1</a> : ''
      }

      { total > 0 ?
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

      { total > 0 &&
        Array.from(pageList).map((pageNumber: number) => {
          let link = <a onClick={() => setPage(pageNumber)} className={`num ${page == pageNumber ? 'now' : ''}`}>{pageNumber}</a>
          return link
        })
      }

      { total > 0 ?
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

      { total > 0 ?
        <a onClick={() => setPage(total)} className="num">{total}</a> : ''
      }

    </div>
  </div>
  )
}

export default NewsItem


