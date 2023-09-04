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
    langSelect.value = L11n.currentLocale;
    langSelect.addEventListener('change', e => {
        if (e.target.value === L11n.currentLocale) {
            return;
        }

        const ctx = appContext.dumpContext();

        // sessionStorage max limit is 5MB so we should decide whether to drop image
        if (ctx.board.image?.length > 4.5 * 1024 * 1024) {
            if (!confirm(L11n.getString(L11n.Keys.Error_CannotPreserveImage))) {
                langSelect.value = L11n.currentLocale;
                langSelect.dispatchEvent(new Event('change'));
                return;
            }
            ctx.board.image = null;
        }
        sessionStorage.setItem('_appContext', JSON.stringify(ctx));
        L11n.setLocale(e.target.value);
    });

    const panelLeftToggle = document.getElementById('panel-left-checkbox');
    const panelRightToggle = document.getElementById('panel-right-checkbox');
    panelLeftToggle.addEventListener('change', e => {
        const prop = L11n.currentLocale === 'ar' ? 'right' : 'left';
        document.querySelector('.panel-left').style[prop] = e.target.checked ? 0 : null;
        document.getElementById('overlay').classList.toggle('open', e.target.checked);
    });
    panelRightToggle.addEventListener('change', e => {
        const prop = L11n.currentLocale === 'ar' ? 'left' : 'right';
        document.querySelector('.panel-right').style[prop] = e.target.checked ? 0 : null;
        document.getElementById('overlay').classList.toggle('open', e.target.checked);
    });
    document.getElementById('overlay').addEventListener('click', () => {
        panelLeftToggle.checked = false;
        panelLeftToggle.dispatchEvent(new Event('change'));
        panelRightToggle.checked = false;
        panelRightToggle.dispatchEvent(new Event('change'));
    })

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
    const customSelects = 
        customSelect('select:not(#font-size)')
        .concat(customSelect('select#font-size', { isEditable: true }));
    for (let cstSelect of customSelects) {
        if (cstSelect.select.id) {
            cstSelect.container.dataset.sid = cstSelect.select.id;
        }
    }
});