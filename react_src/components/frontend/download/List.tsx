import * as React from 'react';

import type { DownloadDataProps,CategoryDataProps } from '../types'
import Item from './Item'
import useSWR from 'swr';
import { fetcher } from '../utils/helper'
import { Translation, useTranslation } from 'react-i18next';

const DownloadItem: React.FC = () => {
  const [selectedCategory, setSelectCategory] = React.useState<number | string>('all')
  const GET_ARTICLE_LIST_URL = `${process.env.REACT_API_URL}/api/download?cid=${selectedCategory}`;
  const GET_CATEGORY_LIST_URL = `${process.env.REACT_API_URL}/api/admin/category?type=download`;
  const { data: downloadList } = useSWR<DownloadDataProps[]>(GET_ARTICLE_LIST_URL,fetcher);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL,fetcher);
  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);

  const { t, i18n } = useTranslation();

  const handleCategoryClick = (categoryId:string | number) => {
    setSelectCategory(categoryId)
  }

  return (
    <div className="main-box vivi-cont-top download-box">
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
              // <Translation>{t => 
              <li
                onClick={() => handleCategoryClick(category.id)}
                className={selectedCategory === category.id ? 'now' : ''}>
                {/* {t(category.name)} */}
                {i18n.language == 'en-us' ? category.name_eng : category.name}
                </li>
              // }</Translation>
              )
          })}
				</ul>
      </div>


      {categories?.map((category: CategoryDataProps, index: number) => {
        return  <div className="classify-item" key={`download-category-${category.id}`}>
          {(selectedCategory == 'all' || selectedCategory == category.id) && <div className="mark-title">
            <img src="/static/image/title-mark.svg" />
            <p>{i18n.language == 'en-us' ? category.name_eng : category.name}</p>
            {/* <Translation>{t => <p>{t(category.name)}</p>}</Translation> */}
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


