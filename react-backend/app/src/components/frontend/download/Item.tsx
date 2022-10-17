import React from 'react';
import type { DownloadDataProps } from 'src/types/frontend'
import moment from 'moment';

const exts = ['pdf','txt','csv']

const DownloadItem: React.VFC<DownloadDataProps> = (props) => {
  const {   title, file,updatedAt,description } = props
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
        {file && file.split(",").map((file, index) => {
          const ext = file.split('.').pop() as string
          const className = exts.includes(ext) ? ext : 'txt'
          return <a href={file} className={`${className} uppercase`} target="_blank" download={file} key={`file-${index}`}>{ext}</a>
        })}
      </div>
    </li>
  )
}

export default DownloadItem