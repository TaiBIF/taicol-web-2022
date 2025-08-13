import * as React from 'react';

import type { ArticleDataProps, ArticleListProps, CategoryDataProps } from '../types'
import Item from './Item'
import useSWR from 'swr';
import { fetcher } from '../utils/helper'
import { Translation, useTranslation } from 'react-i18next';

const ArticleItem: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectCategory] = React.useState<number | string>('all')
  const [page, setPage] = React.useState<number>(1)
  const [total, setTotal] = React.useState<number>(0)
  const [pageList, setPageList] = React.useState<any[]>([])

  let lang_filter = '';
  if (i18n.language == 'en-us') {
    lang_filter = '&show_in_en=1'
  } else {
    lang_filter = '&show_in_zh=1'
  }

  const GET_ARTICLE_LIST_URL = `${process.env.REACT_API_URL}/api/article?page=${page}&cid=${selectedCategory}${lang_filter}`;
  const GET_CATEGORY_LIST_URL = `${process.env.REACT_API_URL}/api/admin/category?type=article`;
  const { data: articleList } = useSWR<ArticleListProps>(GET_ARTICLE_LIST_URL, fetcher);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL, fetcher);
  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);


  React.useEffect(() => {
    if (articleList) {

      let window = 5
      let list_index = Math.ceil(page / window)
      let total_page = Math.ceil(articleList.count / pageSize)

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
  }, [articleList])

  const handleCategoryClick = (categoryId: string | number) => {
    setSelectCategory(categoryId)
    setPage(1)
  }

  return (
    <div className="main-box vivi-cont-top padb-80">
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
                {i18n.language == 'en-us' ? category.name_eng : category.name}
              </li>
            )
          })}
        </ul>
      </div>
      <div className="topic-article-list">
        <ul>
          {articleList?.rows?.map((article: ArticleDataProps, index: number) => <Item {...article} key={`news-${index}`} />)}
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

export default ArticleItem


