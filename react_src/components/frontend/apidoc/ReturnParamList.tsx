import * as React from 'react';

type ApidocReturnParamProps = {
  keyword: string;
  description: string;
  remark:  string;
}

type Props = {
 returnParams?: ApidocReturnParamProps[];
}

const ReturnParamList: React.FC<Props> = (props) => {
  const { returnParams } = props;

  return (
    <>
      <div className="mark-title">
					<img src="/static/image/title-mark.svg"/>
					<p>回傳欄位說明</p>
				</div>
      <div className="ovh-m marb_30">
					<table className="apitable-style border-0" cellPadding={0} cellSpacing={0}>
            <tbody>
             <tr>
							<td width="30%">查詢參數</td>
							<td width="40%">說明</td>
							<td>備註</td>
						</tr>
            {returnParams && returnParams.map((param:ApidocReturnParamProps,index:number) => (
              <tr key={`api-params-${index}`}>
                <td>{param.keyword}</td>
                <td>{param.description}</td>
                <td><a href={`${param.remark}`} target='_blank'>{param.remark}</a></td>
              </tr>
            ))}
            </tbody>
          </table>
				</div>
    </>
  )
}

export default ReturnParamList
