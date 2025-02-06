
import * as React from 'react'
import * as ReactDOM from 'react-dom';    
import "./i18n";
import i18n from "i18next";
import Cookies from 'js-cookie';

const homeElement = document.querySelector('#section-1-kv');
const homeOtherElement = document.querySelector('#home-other');

const newsElement = document.querySelector('#news-list-container');
const newsDetailElement = document.querySelector('#news-detail-container');

const articleElement = document.querySelector('#article-list-container');
const articleDetailElement = document.querySelector('#article-detail-container');
const downloadElement = document.querySelector('#download-list-container');
const statisticsElement = document.querySelector('#statistics-container');
const apiElement = document.querySelector('#api-container');

function HomeComponent() {

    import('./components/frontend/home/index').then(module => {
        const Home = module.default;
        ReactDOM.render(React.createElement(Home), homeOtherElement);
    })
}


function ApiComponent() {

    import('./components/frontend/apidoc').then(module => {
        const ApiPage = module.default;
        ReactDOM.render(React.createElement(ApiPage), apiElement);
    })
}

function StatisticsComponent() {

    import('./components/frontend/statistics').then(module => {
        const StatisticsPage = module.default;
        ReactDOM.render(React.createElement(StatisticsPage), statisticsElement);
    })
}


function NewsDetailComponent() {

    import('./components/frontend/news/detail').then(module => {
        const NewsDetailPage = module.default;
        ReactDOM.render(React.createElement(NewsDetailPage), newsDetailElement);
    })
}


function NewsComponent() {

    import('./components/frontend/news').then(module => {
        const NewsPage = module.default;
        ReactDOM.render(React.createElement(NewsPage), newsElement);
    })
}

function ArticleComponent() {

    import('./components/frontend/article').then(module => {
        const ArticlePage = module.default;
        ReactDOM.render(React.createElement(ArticlePage), articleElement);
    })
}


function ArticleDetailComponent() {

    import('./components/frontend/article/detail').then(module => {
        const ArticleDetailPage = module.default;
        ReactDOM.render(React.createElement(ArticleDetailPage), articleDetailElement);
    })
}


function DownloadComponent() {

    import('./components/frontend/download').then(module => {
        const DownloadPage = module.default;
        ReactDOM.render(React.createElement(DownloadPage), downloadElement);
    })
}


let lang = Cookies.get('django_language')

// detect直接從URL修改語言的情況
if (window.location.pathname.includes('zh-hant')){
    lang = 'zh-hant'
} else if (window.location.pathname.includes('en-us')){
    lang = 'en-us'
}

i18n.changeLanguage(lang)


if(homeElement){
    import('./components/frontend/home/Banner').then(module => {
        const HomeBannerSection = module.default;
        ReactDOM.render(React.createElement(HomeBannerSection), homeElement);
    })

    setTimeout(HomeComponent(), 1000)    
}


if(apiElement){
    ApiComponent()
}

if(newsDetailElement){
    NewsDetailComponent()
}

if(newsElement){
    NewsComponent()
}

if(articleElement){
    ArticleComponent()
}

if(articleDetailElement){
    ArticleDetailComponent()
}

if(downloadElement){
    DownloadComponent()
}

if(statisticsElement){
    StatisticsComponent()
}
