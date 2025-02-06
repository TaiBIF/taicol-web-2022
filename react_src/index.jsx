
// import React from 'react'
// import ReactDOM from 'react-dom';    
import * as React from 'react'
import * as ReactDOM from 'react-dom';    
// import Home from './components/frontend/home/index'
import HomeBannerSection from './components/frontend/home/Banner'
import "./i18n";
import i18n from "i18next";
import Cookies from 'js-cookie';

const homeElement = document.querySelector('#section-1-kv');
const homeOtherElement = document.querySelector('#home-other');

function component() {
    console.log('time')
    import('./components/frontend/home/index').then(module => {
        const Home = module.default;

        ReactDOM.render(React.createElement(Home), homeOtherElement);

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
    ReactDOM.render(React.createElement(HomeBannerSection), homeElement);
    setTimeout(component(), 1000)
    // component();
    // document.querySelector('.ovh').appendChild(component());
}

