import React from 'react';
import moment from 'moment';

type Props = {
  modifiedAt?: string;
  title?: string;
  url?: string;
}

const Info: React.VFC<Props> = (props) => {
  const { modifiedAt, title, url } = props;

  return (
    <>
      <div className="page-update">
					更新日期：{modifiedAt && moment(modifiedAt).format('DD/MM/YYYY')}
      </div>
      <div className="title-box">
        <h2>{title || ''}
          <span></span>
        </h2>
      </div>
      <div className="marb_30">
        本API服務網址為：
        <a href="#">
          {url || ''}
        </a>
      </div>
    </>
  )
}

export default Info
