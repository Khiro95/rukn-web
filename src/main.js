import AppContext from "./app-context";
import L11n from "./utils/localization";

import "./components/text-view-info";
import "./components/drag-resize-item";
import "./components/svg-icon";

import "./styles/main.css";
import "./styles/custom-select.css";

import Quran from "./data/quran_hafs_and_english.xml";

const appContext = AppContext.default;

document.addEventListener("DOMContentLoaded", async function() {
    const langSelect = document.getElementById('lang-select');
    langSelect.value = document.documentElement.lang;
    langSelect.addEventListener('change', e => {
        sessionStorage.setItem('_appContext', JSON.stringify(appContext.dumpContext()));
        L11n.setLocale(e.target.value);
    });

    // load Quran data from .xml file
    try {
        let response = await fetch(Quran);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        let rawXml = await response.text();
        const xmlDoc = new DOMParser().parseFromString(rawXml, 'text/xml');
        appContext.ayaSelector.init(xmlDoc);

        const _previousContext = sessionStorage.getItem('_appContext');
        if (_previousContext) {
            sessionStorage.removeItem('_appContext');
            appContext.loadContext(JSON.parse(_previousContext));
        }
    }
    catch (err) {
        const msg = L11n.getString(L11n.Keys.Error_FetchQuranFailed, err.message);
        console.log(msg, err);
        const txt = document.getElementById('loading-screen-text');
        txt.innerText = msg;
        txt.style.color = 'red';
        return;
    }

    document.getElementById('loading-screen').style.display = 'none';
    customSelect('select:not(#font-size)');
    customSelect('select#font-size', { isEditable: true });
});