import React,{useEffect,useState} from 'react';
import type { ArticleDataProps, ArticleListProps } from 'src/types/frontend'
import Item from './Item'
import useSWR from 'swr';
import type { CategoryDataProps } from 'src/types'
const ArticleItem: React.VFC = () => {
  const [selectedCategory, setSelectCategory] = useState<number | string>('all')
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  const GET_ARTICLE_LIST_URL = `/api/article?page=${page}&cid=${selectedCategory}`;
  const GET_CATEGORY_LIST_URL = `/api/admin/category?type=article`;
  const { data:articleList } = useSWR<ArticleListProps>(GET_ARTICLE_LIST_URL);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL);
  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);

  useEffect(() => {
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
				{
        Array.from(Array(total).keys()).map((index: number) => {
          const pageNumber = index + 1;

          let link = <a href="javascript: void(0)" onClick={() => setPage(pageNumber)} className={`num ${page == index + 1 ? 'now' : ''}`}>{pageNumber}</a>

          if (pageNumber > 1 && total > 2)
            link = <>
              {link}
              <a href="javascript: void(0)" onClick={() => setPage(page-1)} className="back">
                <img src="/images/pagear1.svg"/>
                <p>上一頁</p>
              </a>
            </>

          if (pageNumber == total && total > 2)
            link = <>
              <a href="javascript: void(0)" onClick={() => setPage(page+1)} className="next">
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

export default ArticleItem


