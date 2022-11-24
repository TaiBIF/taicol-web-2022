import * as React from 'react';
import type { DownloadFileDataProps } from '../types'

const DownloadFile: React.FC<DownloadFileDataProps> = (props) => {
  const { type, url } = props

  const urlobj = new URL(url);
  const pathname = urlobj.pathname;

  return <a href={`/static${pathname}`} className={`${type} uppercase`} target="_blank" >{type.toLocaleUpperCase()}</a>
}

export default DownloadFile
