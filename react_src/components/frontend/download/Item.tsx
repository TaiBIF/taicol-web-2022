import * as React from 'react';
import type { DownloadDataProps } from '../types'
import * as moment from 'moment';
import DownloadFile from './File'

const exts = ['pdf','txt','csv']

const DownloadItem: React.FC<DownloadDataProps> = (props) => {
  const { title, DownloadFiles,updatedAt,description } = props
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
