
import * as React from 'react'
import * as ReactDOM from 'react-dom';    
import Home from './components/frontend/home/index'
import HomeBannerSection from './components/frontend/home/Banner'
// import HomeTaxonCountSection from './components/frontend/home/TaxonCountSection'
// import LatestNewsListSection from './components/frontend/home/LatestNewsListSection'
import "./i18n";
import i18n from "i18next";
import Cookies from 'js-cookie';
// import { createRoot } from 'react-dom/client';

// createRoot(document.getElementById("container")).render( <Component/>)

let lang = Cookies.get('django_language')

// detect直接從URL修改語言的情況
if (window.location.pathname.includes('zh-hant')){
    lang = 'zh-hant'
} else if (window.location.pathname.includes('en-us')){
    lang = 'en-us'
}

i18n.changeLanguage(lang)

const homeElement = document.querySelector('#section-1-kv');
const homeOtherElement = document.querySelector('#home-other');
// const homeNewsElement = document.querySelector('#section-3-news');

if(homeElement){

    ReactDOM.render(React.createElement(HomeBannerSection), homeElement);


}
ReactDOM.render(React.createElement(Home), homeOtherElement);
// if(homeCountElement)
//     ReactDOM.render(React.createElement(HomeTaxonCountSection), homeCountElement);

// if(homeNewsElement)
//     ReactDOM.render(React.createElement(LatestNewsListSection), homeNewsElement);



// const newsListElement = document.querySelector('#news-list-container');

// if(newsListElement)
//     ReactDOM.render(React.createElement(NewsPage), newsListElement);

// const newsDetailElement = document.querySelector('#news-detail-container');

// if (newsDetailElement) {
//     const slug = newsDetailElement.getAttribute('data-slug');
//     ReactDOM.render(React.createElement(NewsDetailPage,{slug:slug}), newsDetailElement);
// }

// const articleListElement = document.querySelector('#article-list-container');

// if(articleListElement)
//     ReactDOM.render(React.createElement(ArticlePage), articleListElement);


// const articleDetailElement = document.querySelector('#article-detail-container');

// if (articleDetailElement) {
//     const slug = articleDetailElement.getAttribute('data-slug');
//     ReactDOM.render(React.createElement(ArticleDetailPage,{slug:slug}), articleDetailElement);
// }

// const downloadListElement = document.querySelector('#download-list-container');

// if(downloadListElement)
//     ReactDOM.render(React.createElement(DownloadPage), downloadListElement);

// const statisticElement = document.querySelector('#statistics-container');

// if(statisticElement)
//     ReactDOM.render(React.createElement(StatisticsPage), statisticElement);

// const apiElement = document.querySelector('#api-container');

// if(apiElement)
//     ReactDOM.render(React.createElement(ApiPage), apiElement);
