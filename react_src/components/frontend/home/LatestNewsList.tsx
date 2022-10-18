import * as React from 'react';
import LatestNews from './LatestNews'
import { NewsDataProps, NewsListProps, CategoryDataProps } from '../types'
import useSWR from 'swr'
import MoreButton from '../common/MoreButton'
import { fetcher } from '../utils/helper'
const LatestNewsList: React.FC = () => {
  const [selectedCategory, setSelectCategory] = React.useState<number | string>('all')
  const [page, setPage] = React.useState<number>(1)
  const [total, setTotal] = React.useState<number>(0)
  const pageSize = 3

  const GET_LATEST_NEWS_LIST_URL = `${process.env.REACT_API_URL}/api/news/latest?cid=${selectedCategory}&page=${page}`;
  const GET_CATEGORY_LIST_URL = `${process.env.REACT_API_URL}/api/category?type=news`;
  const { data:newsList } = useSWR<NewsListProps>(GET_LATEST_NEWS_LIST_URL,fetcher);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL,fetcher);

  React.useEffect(() => {
    if (newsList) {
      setTotal(Math.ceil(newsList.count / pageSize))
    }
  }, [newsList])

  const handleCategoryClick = (categoryId:string | number) => {
    setSelectCategory(categoryId)
    setPage(1)
  }

  const handleNextClick = () => {
    const nextPage = page + 1;

    if (nextPage > 1 && page < total) {
      setPage(nextPage)
    }
  }

  const handlePrevClick = () => {
    const prevPage = page - 1;

    if (prevPage > 0) {
      setPage(prevPage)
    }
  }

  return (
    <>
      <div className="top-flex">
        <div className="title-area">
          <h3>NEWS <span></span></h3>
        </div>
        <ul className="news-tab-index">
          <li
            className={selectedCategory =='all' ? 'now' : ''}
            onClick={() => handleCategoryClick('all')}>
            全部

            <div className={selectedCategory === 'all' ? "liney w-full" : 'liney'}></div>
          </li>
          {categories?.map((category:CategoryDataProps,index:number) => {
            return <li
              key={`category-${index}`}
              onClick={() => handleCategoryClick(category.id)}
              className={selectedCategory === category.id ? 'now' : ''}>
              {category.name}
              <div className={selectedCategory === category.id ? "liney w-full" : 'liney'}></div>
            </li>
          })}
        </ul>
      </div>
      <div className="news-area-li clearfix">
						<div className="clearfix news-list-box">
							<ul className='w-full'>
              {newsList?.rows?.map((news: NewsDataProps, index) => {
                  return <LatestNews {...news} key={`latest_news_${index}`} />
              })}
						  </ul>
						</div>
						<div className="index-news-btn">
							<div className="left-btnbox">
								{page > 1 && <div className="left-ar" onClick={() => handlePrevClick()}>
									<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
										<g id="left-ar-btn" transform="translate(-80 -2699)">
											<g id="Ellipse_20" data-name="Ellipse 20" transform="translate(80 2699)" fill="none" stroke="#4c8da7" strokeWidth="2">
												<circle cx="30" cy="30" r="30" stroke="none"></circle>
												<circle cx="30" cy="30" r="29" fill="none"></circle>
											</g>
											<g id="Group_6920" data-name="Group 6920" transform="translate(104 2717)">
												<line id="Line_162" data-name="Line 162" x1="12.06" y2="12.06" fill="none" stroke="#4c8da7" strokeLinecap="round" strokeWidth="2"></line>
												<line id="Line_163" data-name="Line 163" x1="12.06" y1="12.06" transform="translate(0 12.06)" fill="none" stroke="#4c8da7" strokeLinecap="round" strokeWidth="2"></line>
											</g>
										</g>
									</svg>
                </div>
                }
              {page < total && <div className="right-ar" onClick={() => handleNextClick()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
                  <g id="right-ar-btn" transform="translate(-150 -2699)">
                    <g id="right-ar-btn-2" data-name="right-ar-btn">
                      <g id="Ellipse_21" data-name="Ellipse 21" transform="translate(150 2699)" fill="none" stroke="#4c8da7" strokeWidth="2">
                        <circle cx="30" cy="30" r="30" stroke="none"></circle>
                        <circle cx="30" cy="30" r="29" fill="none"></circle>
                      </g>
                    </g>
                    <g id="Group_6919" data-name="Group 6919" transform="translate(-62.5 3.5)">
                      <line id="Line_162" data-name="Line 162" x2="12.06" y2="12.06" transform="translate(236.5 2713.5)" fill="none" stroke="#4c8da7" strokeLinecap="round" strokeWidth="2"></line>
                      <line id="Line_163" data-name="Line 163" y1="12.06" x2="12.06" transform="translate(236.5 2725.56)" fill="none" stroke="#4c8da7" strokeLinecap="round" strokeWidth="2"></line>
                    </g>
                  </g>
                </svg>

              </div>
              }
            </div>
            <MoreButton label='more NEWS' href={`/news?category=${selectedCategory}`}/>

						</div>
					</div>
    </>
  )
}

export default LatestNewsList
