import React,{useEffect,useState} from 'react';
import Item from './Item'
import type { NewsDataProps,NewsListProps } from 'src/types/frontend'
import useSWR from 'swr'
import type { CategoryDataProps } from 'src/types'

const NewsItem: React.VFC = () => {
  const [selectedCategory, setSelectCategory] = useState<number | string>('all')
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  const GET_NEWS_LIST_URL = `/api/news?page=${page}&cid=${selectedCategory}`;
  const GET_CATEGORY_LIST_URL = `/api/admin/category?type=news`;
  const { data:newsList } = useSWR<NewsListProps>(GET_NEWS_LIST_URL);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL);
  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);

  useEffect(() => {
    if (newsList) {
      setTotal(Math.ceil(newsList.count / pageSize))

    }
  }, [newsList])

  const handleCategoryClick = (categoryId:string | number) => {
    setSelectCategory(categoryId)
    setPage(1)
  }

  return (<div className="main-box vivi-cont-top padb-80">
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
			<div className="news-area-cont">
				<div className="news-list-box">
            <ul>
          {newsList?.rows?.map((news: NewsDataProps, index: number) => <Item {...news} key={`news-${index}`} />)}
					  </ul>
				</div>

			</div>
			<div className="page-num">
      {total > 1 &&
        Array.from(Array(total).keys()).map((index: number) => {
          const pageNumber = index + 1;

          let link = <a href="javascript: void(0)" onClick={() => setPage(pageNumber)} className={`num ${page == index + 1 ? 'now' : ''}`}>{pageNumber}</a>

          console.log('pageNumber', pageNumber)
          console.log('total', total)
          if (pageNumber == 2 && total > 2)
            link = <>
              <a href="javascript: void(0)" onClick={() => {
                if(page > 1)
                  setPage(page - 1)
              }} className="back">
                <img src="/images/pagear1.svg"/>
                <p>上一頁</p>
              </a>
              {link}
            </>

          if (pageNumber == total && total > 2)
            link = <>
              <a href="javascript: void(0)" onClick={() => {
                if(page < total)
                  setPage(page + 1)
              }} className="next">
                <img src="/images/pagear2.svg"/>
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

export default NewsItem


