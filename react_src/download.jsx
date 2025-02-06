
import * as React from 'react'
import * as ReactDOM from 'react-dom';

import DownloadPage from './components/frontend/download';
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
const downloadListElement = document.querySelector('#download-list-container');

if(downloadListElement)
    ReactDOM.render(React.createElement(DownloadPage), downloadListElement);