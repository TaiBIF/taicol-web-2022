
import * as React from 'react'
import * as ReactDOM from 'react-dom';    

import StatisticsPage from './components/frontend/statistics';
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

const statisticElement = document.querySelector('#statistics-container');

if(statisticElement)
    ReactDOM.render(React.createElement(StatisticsPage), statisticElement);