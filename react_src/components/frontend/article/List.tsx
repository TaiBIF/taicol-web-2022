import * as React from 'react';

import type { ArticleDataProps, ArticleListProps,CategoryDataProps } from '../types'
import Item from './Item'
import useSWR from 'swr';
import { fetcher } from '../utils/helper'

const ArticleItem: React.FC = () => {
  const [selectedCategory, setSelectCategory] = React.useState<number | string>('all')
  const [page, setPage] = React.useState<number>(1)
  const [total, setTotal] = React.useState<number>(0)
  const GET_ARTICLE_LIST_URL = `${process.env.REACT_API_URL}/api/article?page=${page}&cid=${selectedCategory}`;
  const GET_CATEGORY_LIST_URL = `${process.env.REACT_API_URL}/api/admin/category?type=article`;
  const { data:articleList } = useSWR<ArticleListProps>(GET_ARTICLE_LIST_URL,fetcher);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL,fetcher);
  const pageSize: number = parseInt(process.env.PAGINATE_LIMIT as string);

  React.useEffect(() => {
    if (articleList) {
      setTotal(Math.ceil(articleList.count / pageSize))
    }
  }, [articleList])


  const handleCategoryClick = (categoryId:string | number) => {
    setSelectCategory(categoryId)
    setPage(1)
  }
  return (
    <div className="main-box vivi-cont-top padb-80">
			<div className="cont-tab-area">
				<ul>
          <li
            className={selectedCategory == 'all' ? 'now' : ''}
            onClick={() => handleCategoryClick('all')}>
            全部
          </li>
          {categories?.map((category) => {
            return <li
              onClick={() => handleCategoryClick(category.id)}
              className={selectedCategory === category.id ? 'now' : ''}>
              {category.name}
            </li>
          })}
				</ul>
			</div>
			<div className="topic-article-list">
        <ul>
            {articleList?.rows?.map((article: ArticleDataProps, index: number) => <Item {...article} key={`news-${index}`} />)}
				</ul>
			</div>

			<div className="page-num">
				{total && 
        Array.from(Array(total).keys()).map((index: number) => {
          const pageNumber = index + 1;

          let link = <a href="javascript: void(0)" onClick={() => setPage(pageNumber)} className={`num ${page == index + 1 ? 'now' : ''}`}>{pageNumber}</a>

          if (pageNumber > 1 && total > 2)
            link = <>
              {link}
              <a href="javascript: void(0)" onClick={() => setPage(page-1)} className="back">
                <img src="/static/image/pagear1.svg"/>
                <p>上一頁</p>
              </a>
            </>

          if (pageNumber == total && total > 2)
            link = <>
              <a href="javascript: void(0)" onClick={() => setPage(page+1)} className="next">
                <img src="/static/image/pagear2.svg"/>
                <p>下一頁</p>
                </a>
              {link}
            </>
          return link
        })
      }
			</div>
		</div>
  )
}

export default ArticleItem


