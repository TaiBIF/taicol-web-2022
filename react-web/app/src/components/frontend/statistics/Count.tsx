import React from 'react';

type Props = {
  count: number | string;
  enTitle: string;
  zhTWTitle: string;
  type: 'species' | 'scientific' | 'references';
}
const Count: React.VFC<Props> = (props) => {
  const { count, enTitle, zhTWTitle, type } = props;

  return (
    <li>
      <div className="titlebox">
        <div className="cir_icon">
          {type == 'species' && <img src="/images/ssicon01.svg" />}
          {type == 'scientific' && <img src="/images/ssicon02.svg" />}
          {type == 'references' && <img src="/images/ssicon03.svg" />}
          <div className="cir-line1"></div>
        </div>
        <div className="txtbox">
          <div className="title">
            <h3>{zhTWTitle}</h3>
            <div className="markq">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
                <g id="qs_mark" transform="translate(-1536.736 -1209.631)">
                  <g id="Ellipse_8" data-name="Ellipse 8" transform="translate(1536.736 1209.631)" fill="#fff" stroke="#aaa" stroke-width="1">
                    <circle cx="14" cy="14" r="14" stroke="none"></circle>
                    <circle cx="14" cy="14" r="13.5" fill="none"></circle>
                  </g>
                  <text id="_" data-name="?" transform="translate(1545.736 1230.631)" fill="#aaa" font-size="20" font-family="Fredoka-Regular, Fredoka" letter-spacing="0.05em"><tspan x="0" y="0">?</tspan></text>
                </g>
              </svg>
              <div className="hvbubble">
                <p>包含種下分類群</p>
              </div>
            </div>
          </div>
          <p>{enTitle}</p>
          <div className="numberbox">
            {count}
          </div>
        </div>
      </div>
    </li>
  )
};

export default Count;
