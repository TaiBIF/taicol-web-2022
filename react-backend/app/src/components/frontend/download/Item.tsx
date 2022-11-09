import React from 'react';
import type { DownloadDataProps } from 'src/types/frontend'
import DownloadFile from './File'
import moment from 'moment';

const exts = ['pdf','doc','txt','csv']

const DownloadItem: React.VFC<DownloadDataProps> = (props) => {
  const {   title,DownloadFiles,updatedAt,description } = props
  const date = moment(new Date(updatedAt))

  return (
    <li>
      <div className="left-box-txt">
        <div className="up-date">
          {date.format('YYYY-MM-DD')}
        </div>
        <div className="name">{title}</div>
        <p className="short">{description}</p>
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
