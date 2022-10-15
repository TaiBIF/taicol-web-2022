
import React from 'react';

const SearchForm: React.VFC = () => {
  const [showConditions, setShowConditions] = React.useState<boolean>(false);

  return <div className="splist-search-box">
			<div className="main-box">
				<div className="left-box">
					<p>學名/中文名</p>
        <div className={showConditions ? 'nice-select select-box flex justify-start items-center open' :  'nice-select select-box flex justify-start items-center'} tabIndex={0} onClick={() => setShowConditions(true)}>
          <span className="current">包含</span>
          <ul className="list w-42">
            <li data-value="contain" className={showConditions ?  "option selected focus" : "option  selected"}>包含</li>
            <li data-value="equal" className="option">等於</li>
            <li data-value="startwith" className="option">開頭為</li>
          </ul>
        </div>
				</div>
				<div className="cont-search-bar">
					<input type="text" name="keyword" placeholder="請輸入關鍵字" value=""/>
					<button className="search" type='submit'>
						<svg id="Group_6882" data-name="Group 6882" xmlns="http://www.w3.org/2000/svg"  width="36.847" height="36.775" viewBox="0 0 36.847 36.775">
							<defs>
								<clipPath id="clipPath">
									<rect id="Rectangle_65" data-name="Rectangle 65" width="36.847" height="36.775" fill="#4c8da7"></rect>
								</clipPath>
							</defs>
							<g id="Group_135" data-name="Group 135">
								<path id="Path_6196" data-name="Path 6196" d="M0,15.8V13.791c.093-.611.172-1.224.282-1.832A14.8,14.8,0,0,1,11.626.36C12.373.206,13.135.118,13.89,0h1.943c.091.022.182.049.274.065.813.14,1.642.22,2.438.424a14.772,14.772,0,0,1,9.4,21.166c-.407.768-.9,1.489-1.4,2.3a2.517,2.517,0,0,1,.305.233q4.493,4.478,8.985,8.958a3.734,3.734,0,0,1,1.016,1.4v.718a2.258,2.258,0,0,1-.753,1.148,1.856,1.856,0,0,1-2.5-.29q-4.694-4.682-9.383-9.369A1.8,1.8,0,0,1,24,26.422c-.154.116-.212.156-.27.2A14.833,14.833,0,0,1,.359,17.991C.208,17.268.118,16.532,0,15.8m3.673-1.04A11.15,11.15,0,1,0,14.861,3.676,11.17,11.17,0,0,0,3.673,14.762" fill="#4c8da7"></path>
							</g>
						</svg>
					</button>
				</div>
			</div>
</div>
}

export default SearchForm
