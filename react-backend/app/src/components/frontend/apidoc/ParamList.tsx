import React from 'react';

type ApidocParamProps = {
  keyword: string;
  description: string;
  url:  string;
}

type Props = {
  combine_url: string;
 params?: ApidocParamProps[];
}

const ParamList: React.VFC<Props> = (props) => {
  const { params,combine_url } = props;

  return (
    <>
      <div className="mark-title">
					<img src="/images/title-mark.svg"/>
					<p>API參數說明</p>
				</div>
      <div className="ovh-m">
        <table className="apitable-style border-0" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td>查詢參數</td>
              <td>說明</td>
              <td>範例網址</td>
            </tr>
          {params && params.map((param:ApidocParamProps,index:number) => (
            <tr key={`api-params-${index}`}>
              <td>{param.keyword}</td>
              <td>{param.description}</td>
              <td><a href={`${param.url}`} target='_blank'>{param.url}</a></td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
      <div className="marb_30">
					<span className="color-red">*</span>以上參數可相互組合，如： <br/>
					<a target="_blank" href={combine_url}>{combine_url}</a>
				</div>
    </>
  )
}

export default ParamList
