import * as React from 'react';

import type { DownloadDataProps, DownloadListProps, CategoryDataProps } from '../types'
import Item from './Item'
import useSWR from 'swr';
import { fetcher } from '../utils/helper'
import { Translation, useTranslation } from 'react-i18next';

const DownloadItem: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectCategory] = React.useState<number | string>('all')
  const [page, setPage] = React.useState<number>(1)
  const [total, setTotal] = React.useState<number>(0)
  const [pageList, setPageList] = React.useState<any[]>([])

  const GET_DOWNLOAD_LIST_URL = `${process.env.REACT_API_URL}/api/download?cid=${selectedCategory}&page=${page}`;
  const GET_CATEGORY_LIST_URL = `${process.env.REACT_API_URL}/api/admin/category?type=download`;
  const { data: downloadList } = useSWR<DownloadListProps>(GET_DOWNLOAD_LIST_URL, fetcher);
  const { data: categories } = useSWR<CategoryDataProps[]>(GET_CATEGORY_LIST_URL, fetcher);
  const pageSize: number = parseInt(process.env.NEXT_PUBLIC_PAGINATE_LIMIT as string);

  React.useEffect(() => {
    if (downloadList) {

      let window = 5
      let list_index = Math.ceil(page / window)
      let total_page = Math.ceil(downloadList.count / pageSize)

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
  }, [downloadList])


  const handleCategoryClick = (categoryId: string | number) => {
    setSelectCategory(categoryId)
    setPage(1)
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
              <li
                onClick={() => handleCategoryClick(category.id)}
                className={selectedCategory === category.id ? 'now' : ''}>
                {i18n.language == 'en-us' ? category.name_eng : category.name}
              </li>
            )
          })}
        </ul>
      </div>

      {categories?.map((category: CategoryDataProps, index: number) => {
        return <div className="classify-item" key={`download-category-${category.id}`}>
          {(selectedCategory == 'all' || selectedCategory == category.id) && <div className="mark-title">
            <img src="/static/image/title-mark.svg" />
            <p>{i18n.language == 'en-us' ? category.name_eng : category.name}</p>
          </div>}
          <ul className="download-set">
            {/* 在 all 分頁時 只顯示前4個 */}
            {(selectedCategory == 'all') && downloadList?.rows?.filter((item: DownloadDataProps) => parseInt(item.Category.id) == category.id).slice(0, 4).map((download: DownloadDataProps, index: number) => <Item {...download} key={`news-${index}`} />)}
            {/* 在 特定分類 分頁時 顯示全部 */}
            {(selectedCategory != 'all') && downloadList?.rows?.filter((item: DownloadDataProps) => parseInt(item.Category.id) == category.id).map((download: DownloadDataProps, index: number) => <Item {...download} key={`news-${index}`} />)}
          </ul>
          {/* 在 all 分頁時才有更多的按鈕 */}
          {(selectedCategory == 'all' && downloadList?.rows && downloadList?.rows?.filter((item: DownloadDataProps) => parseInt(item.Category.id) == category.id).length > 4) && <a className="btn-more-download" onClick={() => handleCategoryClick(category.id)}>
            <p>MORE</p>
            <div className="arr">
              <div className="arline"></div>
              <div className="arrrot">
                <img src="/static/image/arrlinrot.svg" />
              </div>
            </div>
          </a>
          }
        </div>
      })}
      {(selectedCategory != 'all') &&
        <div className="page-num">
          {total > 0 ?
            <a  onClick={() => setPage(1)} className="num">1</a> : ''
          }

          {total > 0 ?
            <>
              <a  onClick={() => {
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
              let link = <a  onClick={() => setPage(pageNumber)} className={`num ${page == pageNumber ? 'now' : ''}`}>{pageNumber}</a>
              return link
            })
          }

          {total > 0 ?
            <>
              <a  onClick={() => {
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
            <a  onClick={() => setPage(total)} className="num">{total}</a> : ''
          }

        </div>
      }
    </div>
  )
}

export default DownloadItem


