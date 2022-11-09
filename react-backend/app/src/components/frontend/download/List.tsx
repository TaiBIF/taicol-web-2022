import React,{useEffect,useState} from 'react';
import type { DownloadDataProps } from 'src/types/frontend'
import Item from './Item'
import useSWR from 'swr';
import type { CategoryDataProps } from 'src/types'
const DownloadItem: React.VFC = () => {
  const [selectedCategory, setSelectCategory] = useState<number | string>('all')
  const GET_ARTICLE_LIST_URL = `/api/download?cid=${selectedCategory}`;
  const GET_CATEGORY_LIST_URL = `/api/admin/category?type=download`;
  const { data:downloadList } = useSWR<DownloadDataProps[]>(GET_ARTICLE_LIST_URL);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL);
  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);


  const handleCategoryClick = (categoryId:string | number) => {
    setSelectCategory(categoryId)
  }

  return (
    <div className="main-box vivi-cont-top download-box">
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


      {categories?.map((category: CategoryDataProps, index: number) => {
        return <div className="classify-item" key={`download-category-${category.id}`}>
          {(selectedCategory == 'all' || selectedCategory == category.id) && <div className="mark-title">
            <img src="/images/title-mark.svg" />
            <p>{category.name}</p>
          </div>}
          <ul className="download-set">
            {downloadList?.filter((item: DownloadDataProps) => parseInt(item.Category.id) == category.id).map((download: DownloadDataProps, index: number) => <Item {...download} key={`news-${index}`} />)}
          </ul>
        </div>
      })}
		</div>
  )
}

export default DownloadItem


