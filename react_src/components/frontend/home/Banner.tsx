import * as React from 'react';

const Banner: React.FC = () => {
  const [keyword, setKeyword] = React.useState('');

  const handleSearch = () => {
    window.location.href = `/catalogue?filter=0&keyword=${keyword}`;
  }

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	}
	
  return (
    <section className="section-1-kv">
			<div className="bg">
				<img src="/static/image/index-sechtion-1-bg.png"/>
			</div>
			<div className="bg-top-let">
				<img src="/static/image/index-sechtion-1-item1.png"/>
			</div>
			<div className="bg-top-right">
				<img src="/static/image/index-sechtion-1-item2.png"/>
			</div>
			<div className="cir-yel">
				<img src="/static/image/cir_yel.png"/>
			</div>
			<div className="cir-blue">
				<img src="/static/image/cir_blue.png"/>
			</div>
			<div className="float-ite01">
				<img src="/static/image/float_ite01.png"/>
			</div>
			<div className="float-ite02">
				<img src="/static/image/float_ite02.png"/>
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
						<input type="text" placeholder="請輸入關鍵字" onKeyDown={handleKeyDown} onChange={(e) =>setKeyword(e.target.value)}/>
						<a href="/catalogue?filter=2" className="more">
							<svg xmlns="http://www.w3.org/2000/svg" width="27" height="23" viewBox="0 0 27 23">
								<path id="Polygon_1" data-name="Polygon 1" d="M11.775,2.939a2,2,0,0,1,3.45,0L25.232,19.988A2,2,0,0,1,23.507,23H3.493a2,2,0,0,1-1.725-3.012Z" transform="translate(27 23) rotate(180)" fill="#4c8da7"></path>
							</svg>
						</a>
						<button className="search" onClick={handleSearch}>
              <svg id="Group_6882" data-name="Group 6882" xmlns="http://www.w3.org/2000/svg"
                width="36.847" height="36.775" viewBox="0 0 36.847 36.775">
								<defs>
									<clipPath id="clipPath">
										<rect id="Rectangle_65" data-name="Rectangle 65" width="36.847" height="36.775" fill="#4c8da7"></rect>
									</clipPath>
								</defs>
								<g id="Group_135" data-name="Group 135" clipPath="url(#clipPath)">
									<path id="Path_6196" data-name="Path 6196" d="M0,15.8V13.791c.093-.611.172-1.224.282-1.832A14.8,14.8,0,0,1,11.626.36C12.373.206,13.135.118,13.89,0h1.943c.091.022.182.049.274.065.813.14,1.642.22,2.438.424a14.772,14.772,0,0,1,9.4,21.166c-.407.768-.9,1.489-1.4,2.3a2.517,2.517,0,0,1,.305.233q4.493,4.478,8.985,8.958a3.734,3.734,0,0,1,1.016,1.4v.718a2.258,2.258,0,0,1-.753,1.148,1.856,1.856,0,0,1-2.5-.29q-4.694-4.682-9.383-9.369A1.8,1.8,0,0,1,24,26.422c-.154.116-.212.156-.27.2A14.833,14.833,0,0,1,.359,17.991C.208,17.268.118,16.532,0,15.8m3.673-1.04A11.15,11.15,0,1,0,14.861,3.676,11.17,11.17,0,0,0,3.673,14.762" fill="#4c8da7"></path>
								</g>
							</svg>
						</button>
					</div>
				</div>
				<div className="right-box">
					<div className="bn-kvbox">
						<div className="base1">
							<img src="/static/image/bn-img02.png"/>
						</div>
						<div className="base2">
							<img src="/static/image/bn-img01.png"/>
						</div>
						<div className="base3">
							<img src="/static/image/bn-img03.png"/>
						</div>
						<div className="animal1">
							<img src="/static/image/bn-img04.png"/>
						</div>
						<div className="animal2">
							<img src="/static/image/bn-img05.png"/>
						</div>
					</div>
				</div>
			</div>
    </section>
    )
}

export default Banner
