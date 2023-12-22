import * as React from 'react';
import type { DownloadDataProps } from '../types'
import * as moment from 'moment';
import DownloadFile from './File'
import { Trans, useTranslation } from 'react-i18next';

const exts = ['pdf','txt','csv']

const DownloadItem: React.FC<DownloadDataProps> = (props) => {
  const { title, DownloadFiles, publishedDate, description, title_eng, description_eng } = props
  const date = moment(new Date(publishedDate))
  // isLoggedIn ? () : ()
  const { t, i18n } = useTranslation();


  return (
    <li>
      <div className="left-box-txt">
        <div className="up-date">
          {date.format('YYYY-MM-DD')}
        </div>
        {/* <div className="name">{title}</div> */}
        <div className="name">{i18n.language == 'en-us' ? title_eng : title}</div>
        {/* <p className="short">{description}</p> */}
        <p className="short">{i18n.language == 'en-us' ? description_eng : description}</p>
      </div>
      <div className="right-file">
        {DownloadFiles && DownloadFiles.map((file, index) => {
          return <DownloadFile type={file.type} url={file.url} key={`download-file-${index}`} />
        })}
      </div>
    </li>
  )
}

export default DownloadItem
