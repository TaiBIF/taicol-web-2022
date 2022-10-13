import * as React from 'react';

type ApidocResponseProps = {
  title?: string;
  content?: string;
}

type Props = {
 data?: ApidocResponseProps[];
}

const ResponseList: React.FC<Props> = (props) => {
  const { data } = props;
  console.log('data',data)
  return (
    <>{
      data && data.map((item: ApidocResponseProps, index: number) => {
        return <div key={`api-response-${index}`}>
          <div className="mark-title">
            <img src="/static/image/title-mark.svg" />
            <p>{item.title}</p>
          </div>
          {item.content && <div dangerouslySetInnerHTML={{ __html: item.content.replace('<pre><code class=\"language-plaintext\">','').replace('</code></pre>','') }} />}
        </div>
      })}
    </>
  )
}

export default ResponseList
