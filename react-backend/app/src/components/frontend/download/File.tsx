import React from 'react';
import type { DownloadFileDataProps } from 'src/types/table'

const DownloadFile: React.VFC<DownloadFileDataProps> = (props) => {
  const { type, url } = props

  return <a href={url} className={`${type} uppercase`} target="_blank" download>{type.toLocaleUpperCase()}</a>
}

export default DownloadFile
