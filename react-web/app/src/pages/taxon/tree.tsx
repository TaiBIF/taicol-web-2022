import BreadCrumb from 'src/components/frontend/common/BreadCrumb'
import Taicol from 'src/components/frontend/tree/Taicol'
import {BreadCrumbProps} from 'src/types/frontend'

const breadcrumbs:BreadCrumbProps[] = [
  { title: '首頁', href: '/' },
  {title: '物種樹'}
]

const TaxonTree = () => {
  return (
  <div className="page-top">
		<div className="short-top">
			<BreadCrumb breadcrumbs={breadcrumbs} />
			<div className="main-box">
				<div className="float-dot-yel">
					<img src="/images/cir_yel.png"/>
				</div>
				<div className="float-dot-blue">
					<img src="/images/cir_blue.png"/>
				</div>
				<div className="title-box">
					<h2 className='text-sm'>物種樹</h2>
					<p>TAXON TREE</p>
				</div>
			</div>
		</div>
		<div className="hot-search-box">
			<div className="main-box">

				<h3>熱門搜尋階層</h3>
				<div className="seach-tag-area">

						<a href="javascript:;">
							<p>木蘭綱</p>
						</a>

						<a href="javascript:;" >
							<p>錐大蚊科</p>
						</a>

						<a href="javascript:;" >
							<p>大蚊科</p>
						</a>

						<a href="javascript:;" >
							<p>臺灣山蝸牛屬</p>
						</a>

						<a href="javascript:;" >
							<p>渦螺屬</p>
						</a>

						<a href="javascript:;" >
							<p>鳥綱</p>
						</a>

				</div>

				<div className="cont-search-bar">
					<input type="text" name="keyword" id="keyword" placeholder="請輸入關鍵字"/>
          <input type="hidden" name="keyword_taxon_id" id="keyword_taxon_id" />
          <button className="search">
            <svg id="Group_6882" data-name="Group 6882" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="36.847" height="36.775" viewBox="0 0 36.847 36.775">
              <defs>
                <clipPath id="clipPath">
                  <rect id="Rectangle_65" data-name="Rectangle 65" width="36.847" height="36.775" fill="#4c8da7"/>
                </clipPath>
              </defs>
              <g id="Group_135" data-name="Group 135" clipPath="url(#clipPath)">
                <path id="Path_6196" data-name="Path 6196" d="M0,15.8V13.791c.093-.611.172-1.224.282-1.832A14.8,14.8,0,0,1,11.626.36C12.373.206,13.135.118,13.89,0h1.943c.091.022.182.049.274.065.813.14,1.642.22,2.438.424a14.772,14.772,0,0,1,9.4,21.166c-.407.768-.9,1.489-1.4,2.3a2.517,2.517,0,0,1,.305.233q4.493,4.478,8.985,8.958a3.734,3.734,0,0,1,1.016,1.4v.718a2.258,2.258,0,0,1-.753,1.148,1.856,1.856,0,0,1-2.5-.29q-4.694-4.682-9.383-9.369A1.8,1.8,0,0,1,24,26.422c-.154.116-.212.156-.27.2A14.833,14.833,0,0,1,.359,17.991C.208,17.268.118,16.532,0,15.8m3.673-1.04A11.15,11.15,0,1,0,14.861,3.676,11.17,11.17,0,0,0,3.673,14.762" fill="#4c8da7"/>
              </g>
            </svg>
          </button>
          </div>
          <span className="select2-container select2-container--default select2-container--open absolute hidden ">
            <span className="select2-dropdown select2-dropdown--below w-[1238px]" dir="ltr">
              <span className="select2-search select2-search--dropdown">
                <input className="select2-search__field border-hidden" type="search"  autoCorrect="off" autoCapitalize="none" spellCheck="false" role="searchbox" aria-autocomplete="list" autoComplete="off" aria-label="Search" aria-controls="select2-keyword-results" />
              </span>
              <span className="select2-results">
                <ul className="select2-results__options" role="listbox" id="select2-keyword-results" aria-expanded="true" aria-hidden="false">
                  <li className="select2-results__option select2-results__option--selectable" role="option" data-select2-id="select2-data-14-rdh6" aria-selected="false">Bathophilus kingi 四絲深巨口魚,巨口魚</li>
                </ul>
              </span>
            </span>
          </span>
			</div>
		</div>
		<div className="tree-area">
			<div className="main-box">
				<ul className="rank-1-red">
          <Taicol children={[]} taxon_id='test' category='界' stat='19門 58綱 313目 2297科 1亞科 14346屬 37714種 129種下 1雜交組合' name='動物界 Kingdom Animalia'/>



				</ul>
			</div>
		</div>
	</div>
  )
}

export default TaxonTree
