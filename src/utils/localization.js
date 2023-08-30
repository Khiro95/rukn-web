import arData from '../locales/ar.json';
import enData from '../locales/en.json';
import Keys from '../locales/keys.json';

const localeData = {
    ar: arData.runtime_resource,
    en: enData.runtime_resource,
};

const currentLocale = document.documentElement.lang;

function getString(key = '', ...args) {
    if (!key) {
        return null;
    }

    let str = localeData[currentLocale][key];
    
    if (args?.length) {
        // if args are provided, then try to format the string using them
        args.forEach((a, index) => str = str.replaceAll(`{${index}}`, a));
    }

    return str;
}

function setLocale(locale) {
    localStorage.setItem('_locale', locale);
    location.pathname = '/' + locale;
}

export default { getString, setLocale, currentLocale, Keys };