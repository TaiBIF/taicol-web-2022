
import * as React from 'react'
import * as ReactDOM from 'react-dom';    

import ArticlePage from './components/frontend/article';
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
const articleListElement = document.querySelector('#article-list-container');

if(articleListElement)
    ReactDOM.render(React.createElement(ArticlePage), articleListElement);