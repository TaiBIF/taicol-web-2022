
import * as React from 'react'
import * as ReactDOM from 'react-dom';    
// import HomePage from './components/frontend/home'
import HomeBannerSection from './components/frontend/home/Banner'
import HomeTaxonCountSection from './components/frontend/home/TaxonCountSection'
import LatestNewsListSection from './components/frontend/home/LatestNewsListSection'

// const HomeTaxonCountSection = lazy(() => import("./TaxonCountSection"));
// const LatestNewsListSection = lazy(() => import('./LatestNewsListSection'));

// import NewsPage from './components/frontend/news';
// import NewsDetailPage from './components/frontend/news/detail';
// import ArticlePage from './components/frontend/article';
// import ArticleDetailPage from './components/frontend/article/detail';
// import DownloadPage from './components/frontend/download';
// import StatisticsPage from './components/frontend/statistics';
// import ApiPage from './components/frontend/apidoc';
import "./i18n";
import i18n from "i18next";
import Cookies from 'js-cookie';

let lang = Cookies.get('django_language')

// detect直接從URL修改語言的情況
if (window.location.pathname.includes('zh-hant')){
    lang = 'zh-hant'
} else if (window.location.pathname.includes('en-us')){
    lang = 'en-us'
}

i18n.changeLanguage(lang)

const homeElement = document.querySelector('#section-1-kv');

if(homeElement){

    ReactDOM.render(React.createElement(HomeBannerSection), homeElement);

    const homeCountElement = document.querySelector('#section-2-statistics');

    if(homeCountElement)
        ReactDOM.render(React.createElement(HomeTaxonCountSection), homeCountElement);

    const homeNewsElement = document.querySelector('#section-3-news');

    if(homeNewsElement)
        ReactDOM.render(React.createElement(LatestNewsListSection), homeNewsElement);
}


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
