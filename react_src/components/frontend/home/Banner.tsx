import * as React from 'react';
// import { Translation } from 'react-i18next';
import { useTranslation, Translation } from 'react-i18next';

const Banner: React.FC = () => {
  const [keyword, setKeyword] = React.useState('');
  const [isMoreOpen, setIsMoreOpen] = React.useState(false); // 👈 新增 state

  const handleSearch = () => {
    window.location.href = `/catalogue?filter=0&=contain&keyword=${keyword}`;
  }

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	}
	const { t, i18n } = useTranslation();
	let placeholder_keyword = t("請輸入關鍵字")

  return (
    <section className="section-1-kv">
			<div className="bg">
				<img loading="lazy" src="/static/image/index-sechtion-1-bg.png"/>
			</div>
			<div className="bg-top-let">
				<img loading="lazy" src="/static/image/index-sechtion-1-item1.png"/>
			</div>
			<div className="bg-top-right">
				<img loading="lazy" src="/static/image/index-sechtion-1-item2.png"/>
			</div>
			<div className="cir-yel">
				<img loading="lazy" src="/static/image/cir_yel.png"/>
			</div>
			<div className="cir-blue">
				<img loading="lazy" src="/static/image/cir_blue.png"/>
			</div>
			<div className="float-ite01">
				<img loading="lazy" src="/static/image/float_ite01.png"/>
			</div>
			<div className="float-ite02">
				<img loading="lazy" src="/static/image/float_ite02.png"/>
			</div>
			<div className="flex-box">
				<div className="left-box">
					<div className="slogan">
						<h3>臺灣最具指標性且全面的<br/>物種名錄資料庫</h3>
						<h2><span>The most complete, authoritative list of Taiwan’s species</span>
							<div className="line"></div>
						</h2>
					</div>
					<div className="search-bar">
						<input type="text" placeholder={placeholder_keyword} onKeyDown={handleKeyDown} onChange={(e) =>setKeyword(e.target.value)} />
						<div className="more">
							<div className="arrbtn"
							    onClick={() => setIsMoreOpen(!isMoreOpen)} // 👈 點擊時 toggle
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="27" height="23" viewBox="0 0 27 23">
									<path id="Polygon_1" data-name="Polygon 1" d="M11.775,2.939a2,2,0,0,1,3.45,0L25.232,19.988A2,2,0,0,1,23.507,23H3.493a2,2,0,0,1-1.725-3.012Z" transform="translate(27 23) rotate(180)" fill="#4c8da7"/>
								</svg>
							</div>
							<div className={`more-itembox ${isMoreOpen ? 'open' : ''}`}>
								<div className="item-flex marb_10">
									<p>
										<Translation>{t => <>{t('學名/中文名')}</>}</Translation>
									</p>
									<select className="indexSelect">
									<option value="1">選項 1</option>
									<option value="2">選項 2</option>
									<option value="3">選項 3</option>
									</select>

								</div>
								<div className="item-flex marb_10">
									<p>
										<Translation>{t => <>{t('較高分類群')}</>}</Translation>
									</p>
									<select className="select-st1" name="" id="">
										<option value="">請輸入查詢字串</option>
									</select>
								</div>
								<div className="right-btn">
									<a href="/catalogue?filter=2" className="linkto">
										<Translation>{t => <>{t('更多項目')}</>}</Translation>
										<svg xmlns="http://www.w3.org/2000/svg" width="6.451" height="11.405" viewBox="0 0 6.451 11.405">
											<path id="Union_130" data-name="Union 130" d="M5.173,6.23.22,1.281A.75.75,0,0,1,1.281.22L5.7,4.641,10.123.22a.751.751,0,1,1,1.061,1.062L6.231,6.23a.736.736,0,0,1-.527.221A.749.749,0,0,1,5.173,6.23Z" transform="translate(0 11.405) rotate(-90)" fill="#fff"/>
										</svg>
									</a>
								</div>
							</div>
						</div>
						<button className="search">
							<svg id="Group_6882" data-name="Group 6882" xmlns="http://www.w3.org/2000/svg" width="36.847" height="36.775" viewBox="0 0 36.847 36.775">
								<defs>
									<clipPath id="clip-path">
										<rect id="Rectangle_65" data-name="Rectangle 65" width="36.847" height="36.775" fill="#4c8da7"/>
									</clipPath>
								</defs>
								<g id="Group_135" data-name="Group 135" clip-path="url(#clip-path)">
									<path id="Path_6196" data-name="Path 6196" d="M0,15.8V13.791c.093-.611.172-1.224.282-1.832A14.8,14.8,0,0,1,11.626.36C12.373.206,13.135.118,13.89,0h1.943c.091.022.182.049.274.065.813.14,1.642.22,2.438.424a14.772,14.772,0,0,1,9.4,21.166c-.407.768-.9,1.489-1.4,2.3a2.517,2.517,0,0,1,.305.233q4.493,4.478,8.985,8.958a3.734,3.734,0,0,1,1.016,1.4v.718a2.258,2.258,0,0,1-.753,1.148,1.856,1.856,0,0,1-2.5-.29q-4.694-4.682-9.383-9.369A1.8,1.8,0,0,1,24,26.422c-.154.116-.212.156-.27.2A14.833,14.833,0,0,1,.359,17.991C.208,17.268.118,16.532,0,15.8m3.673-1.04A11.15,11.15,0,1,0,14.861,3.676,11.17,11.17,0,0,0,3.673,14.762" fill="#4c8da7"/>
								</g>
							</svg>
						</button>
					</div>
				</div>

				<div className="right-box">
					<div className="bn-kvbox">
						<div className="base1">
							<img loading="lazy" src="/static/image/bn-img02.png"/>
						</div>
						<div className="base2">
							<img loading="lazy" src="/static/image/bn-img01.png"/>
						</div>
						<div className="base3">
							<img loading="lazy" src="/static/image/bn-img03.png"/>
						</div>
						<div className="animal1">
							<img loading="lazy" src="/static/image/bn-img04.png"/>
						</div>
						<div className="animal2">
							<img loading="lazy" src="/static/image/bn-img05.png"/>
						</div>
					</div>
				</div>
			</div>
    </section>
    )
}

export default Banner
