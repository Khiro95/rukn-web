import DragResizeItem from "./components/drag-resize-item";
import L11n from "./utils/localization";
import utils from "./utils/utils"

class AppContext {
    constructor() {
        this.ayaSelector = new AyaSelector();
        this.board = new BoardContext();
        this.items = [
            new AyaReferenceItem('arabic-ref', this.ayaSelector, true),
            new AyaReferenceItem('english-ref', this.ayaSelector, false),
            new ArabicAyaItem(this.ayaSelector),
            new EnglishTranslationItem(this.ayaSelector)
        ];

        this.items[2].reference = this.items[0];
        this.items[3].reference = this.items[1];

        this.textColorInput = document.getElementById('text-color');
        this.fontSizeInput = document.getElementById('font-size');
        this.alignStyleInput = document.getElementById('alignment-style');
        this.numbersSwitch = document.getElementById('numbers-switch');
        this.parenthesesSwitch = document.getElementById('parentheses-switch');
        this.parenthesesSpacesSwitch = document.getElementById('parentheses-spaces');
        this.parenthesesSelector = document.getElementById('parentheses-select');
        this.refModeSelector = document.getElementById('ref-mode-select');
        this.refBracketsSwitch = document.getElementById('ref-brackets-switch');

        this.parenthesesSelector.innerHTML = [
            '\ufd5f\ufd5e',
            '\ufd61\ufd60',
            '\ufd63\ufd62',
            '\ufd65\ufd64',
            '\ufd67\ufd66',
            '\ufd69\ufd68',
            '\ufd6b\ufd6a',
            '\ufd6d\ufd6c',
            '\ufd6f\ufd6e',
            '\ufd71\ufd70',
            '\ufd73\ufd72',
            '\ufd75\ufd74',
            '\ufd77\ufd76',
            '\ufd79\ufd78',
            '\ufd7b\ufd7a',
            '\ufd7d\ufd7c',
        ].map(p =>`<option value="${p}">${p}</opion>`).join('');

        const generateImageBlob = function(callback) {
            const canvas = document.createElement("canvas");
            canvas.width = this.board.width;
            canvas.height = this.board.height;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = this.board.background;
            ctx.fillRect(0, 0, this.board.width, this.board.height);

            ctx.drawImage(this.board.thumbnail, 0, 0);

            for (let child of this.board.element.children) {
                const itm = this.items.find(i => i.element == child);
                ctx.fillStyle = itm.textColor;
                ctx.font = `${itm.fontSize}px ${itm.fontFamily}`;
                ctx.direction = itm.isArabic ? 'rtl' : 'ltr';
                ctx.textAlign = itm.alignment;
                const itemRect = itm.rect;
                if (itm.alignment === 'center') {
                    itemRect.x += Math.floor(itemRect.width / 2);
                }
                else if (itm.alignment === 'right') {
                    itemRect.x += itemRect.width;
                }
                const wrapped = utils.wrapText(ctx, itm.text, itemRect.x, itemRect.y, itemRect.width, itm.lineHeight * itm.fontSize);
                wrapped.forEach(line => ctx.fillText(line[0], line[1], line[2]));
            }
            canvas.toBlob(callback);
        }.bind(this);
        
        // attach event listeners
        document.getElementById('board-wrapper').addEventListener('mousedown', e => {
            e.preventDefault();
            this.selectedItem = null;
        });
        document.getElementById('save-btn').addEventListener('click', () => {
            generateImageBlob(blob => {
                const fileName = prompt(L11n.getString(L11n.Keys.InsertName));
                if (fileName === null) {
                    return;
                }
                const downloader = document.createElement('a');
                const url = URL.createObjectURL(blob);
                downloader.href = url;
                downloader.download = fileName;
                downloader.click();
                URL.revokeObjectURL(url);
            });
        });
        document.getElementById('copy-btn').addEventListener('click', () => {
            if (navigator.clipboard.write === undefined) {
                alert(L11n.getString(L11n.Keys.Error_ClipboardNotSupported));
                return;
            }
            generateImageBlob(blob => {
                navigator.clipboard.write([new ClipboardItem({ ['image/png']: blob })]);
            });
        });
        this.textColorInput.addEventListener('input', e => {
            let item = this.selectedItem;
            if (item) {
                item.textColor = e.target.value;
            }
        });
        this.fontSizeInput.addEventListener('change', e => {
            let item = this.selectedItem;
            if (item) {
                let value = e.target.value === '' ? 16 : Number(e.target.value);
                value = value < 16 ? 16 : value;
                item.fontSize = value;
                if (e.target.value != value) {
                    e.target.value = value;
                }
            }
        });
        this.alignStyleInput.addEventListener('click', e => {
            let item = this.selectedItem;
            if (item && e.target instanceof HTMLInputElement) {
                item.alignment = e.target.dataset.alignment;
            }
        });
        this.numbersSwitch.querySelector('input').addEventListener('change', e => {
            let item = this.selectedItem;
            if (item && 'includeNumbers' in item) {
                item.includeNumbers = e.target.checked;
                item.updateText();
            }
        });
        this.parenthesesSwitch.querySelector('input').addEventListener('change', e => {
            let item = this.selectedItem;
            if (item instanceof ArabicAyaItem) {
                item.includeParentheses = e.target.checked;
                item.updateText();
                document.getElementById('parentheses-props').classList.toggle('hidden', !e.target.checked);
            }
        });
        this.parenthesesSpacesSwitch.querySelector('input').addEventListener('change', e => {
            let item = this.selectedItem;
            if (item instanceof ArabicAyaItem) {
                item.includeSpaces = e.target.checked;
                item.updateText();
            }
        });
        this.parenthesesSelector.addEventListener('change', e => {
            let item = this.selectedItem;
            if (item instanceof ArabicAyaItem) {
                item.parentheses = e.target.value;
                item.updateText();
            }
        });
        this.refModeSelector.addEventListener('change', e => {
            let item = this.selectedItem;
            if (item instanceof AyaReferenceItem && item.mode != e.target.value) {
                item.mode = e.target.value;

                let parent = this.items.find(i => i.reference == item);
                parent.updateText();
            }
            else if ((item instanceof ArabicAyaItem || item instanceof EnglishTranslationItem) && item.reference.mode != e.target.value) {
                item.reference.mode = e.target.value;
                item.updateText();
            }
            document.getElementById('ref-brackets-switch').classList.toggle('hidden', e.target.value === 'None');
        });
        this.refBracketsSwitch.querySelector('input').addEventListener('change', e => {
            let item = this.selectedItem;
            if (item instanceof AyaReferenceItem) {
                item.includeBrackets = e.target.checked;
                item.updateText();

                let parent = this.items.find(i => i.reference == item);
                parent.updateText();
            }
            else if (item instanceof ArabicAyaItem || item instanceof EnglishTranslationItem) {
                item.reference.includeBrackets = e.target.checked;
                item.reference.updateText();
                item.updateText();
            }
        });

        let options = {
            subtree: true,
            attributes: true,
            attributeFilter: ['selected']
        };

        new MutationObserver(mutations => {
            for (let mutation of mutations) {
                if (mutation.type === 'attributes') {
                    if (mutation.target.selected) {
                        this.selectedItem = this.items.find(i => i.element == mutation.target);
                    }
                }
            }
        }).observe(this.board.element, options);
    }

    get selectedItem() {
        return this.items.find(i => i.element.selected);
    }
    set selectedItem(selectedItem) {
        this.items.forEach(item => item.element.selected = item == selectedItem);
        
        if (selectedItem && this.items.includes(selectedItem)) {
            document.getElementById('item-styles').classList.remove('hidden');
            document.getElementById('item-styles-panel-header').innerText = selectedItem.name;
            this.textColorInput.value = selectedItem.textColor;
            this.fontSizeInput.value = selectedItem.fontSize;
            this.fontSizeInput.dispatchEvent(new Event('change'));
            this.alignStyleInput.querySelector(`input[data-alignment="${selectedItem.alignment}"]`).checked = true;
            
            if (selectedItem instanceof ArabicAyaItem || selectedItem instanceof EnglishTranslationItem) {
                document.getElementById('aya-text-features').style.display = 'block';
                this.numbersSwitch.removeAttribute('hidden');
                this.numbersSwitch.querySelector('input').checked = selectedItem.includeNumbers;
                if (selectedItem instanceof ArabicAyaItem) {
                    this.parenthesesSwitch.removeAttribute('hidden');
                    this.parenthesesSwitch.querySelector('input').checked = selectedItem.includeParentheses;

                    document.getElementById('parentheses-props').classList.toggle('hidden', !selectedItem.includeParentheses);
                    
                    this.parenthesesSpacesSwitch.querySelector('input').checked = selectedItem.includeSpaces;
                    
                    this.parenthesesSelector.value = selectedItem.parentheses;
                }
                else {
                    this.parenthesesSwitch.setAttribute('hidden', '');
                    document.getElementById('parentheses-props').classList.add('hidden');
                }

                this.refModeSelector.value = selectedItem.reference.mode;
                this.refModeSelector.dispatchEvent(new Event('change'));
                this.refBracketsSwitch.querySelector('input').checked = selectedItem.reference.includeBrackets;
            }
            else {
                document.getElementById('aya-text-features').style.display = 'none';
                if (selectedItem instanceof AyaReferenceItem) {
                    this.refModeSelector.value = selectedItem.mode;
                    this.refBracketsSwitch.querySelector('input').checked = selectedItem.includeBrackets;
                    document.getElementById('ref-brackets-switch').classList.toggle('hidden', selectedItem.mode === 'None');
                }
            }
        }
        else {
            document.getElementById('item-styles').classList.add('hidden');
        }
    }

    dumpContext() {
        return {
            selector: {
                sura: this.ayaSelector.sura,
                start: this.ayaSelector.ayaStart,
                end: this.ayaSelector.ayaEnd,
                isRange: this.ayaSelector.isRange,
            },
            board: {
                width: this.board.width,
                height: this.board.height,
                background: this.board.background,
            },
            items: this.items.map(i => i.dump()),
        };
    }

    loadContext(context) {
        if (context) {
            if (context.selector) {
                this.ayaSelector.loadState(context.selector);
            }
            if (context.board) {
                this.board.width = context.board.width;
                this.board.height = context.board.height;
                this.board.background = context.board.background;
            }
            if (Array.isArray(context.items)) {
                context.items.forEach(ci => {
                    const item = this.items.find(i => i.id === ci.id);
                    item.reloadConfig(ci);
                    item.updateText();
                    if (!item.isReference && document.contains(item.element) !== ci.visible) {
                        document.querySelector(`text-view-info[source="${ci.id}"]`).click();
                    }
                });
                // In case ref text was updated AFTER verse text
                this.items.filter(i => !i.isReference).forEach(i => i.updateText());
            }
        }
    }
}

class AyaSelector extends EventTarget {
    constructor() {
        super();

        this.isReady = false;
        this.isRange = false;
        this.quran = {
            quranXml: null,
            getAyaCount: function (s) {
                return this.quranXml.querySelector(`Sura[ID="${s}"] Ayas`)?.children.length;
            },
            getSuraCount: function () {
                return this.quranXml.querySelector(`Suras`)?.children.length;
            },
            getMetaData: function () {
                const arr = [];
                this.quranXml.querySelectorAll('Sura').forEach(s => {
                    arr.push({
                        id: s.attributes.ID.value,
                        name: s.attributes.Name.value,
                        englishName: s.attributes.EnglishName.value,
                    });
                });
                return arr;
            },
            getAyatData: function(sura, start, end) {
                const suraElement = this.quranXml.querySelector(`Sura[ID="${sura}"]`);
                const ayat = [];
                for (let i = start; i >= start && i <= end; i++) {
                    let ayaElement = suraElement.querySelector(`Aya[ID="${i}"]`);
                    ayat.push({
                        id: i,
                        text: ayaElement.querySelector('Text').textContent,
                        englishText: ayaElement.querySelector('EnglishText').textContent
                    });
                }
                return {
                    sura: {
                        id: suraElement.attributes.ID.value,
                        name: suraElement.attributes.Name.value,
                        englishName: suraElement.attributes.EnglishName.value,
                    },
                    ayat
                };
            }
        };

        this.suraSelector = document.getElementById('sura-select');
        this.ayaFromSelector = document.getElementById('aya-from-select');
        this.ayaToSelector = document.getElementById('aya-to-select');
        this.isRangeToggle = document.getElementById('isrange-toggle');

        // init listeners
        this.suraSelector.addEventListener('change', () => {
            if (!this.isReady) {
                return;
            }
            const sura = Number(this.suraSelector.value)
            if (Number.isInteger(sura)) {
                const count = this.quran.getAyaCount(sura);
                if (Number.isInteger(count)) {
                    const options = [];
                    for (let i = 1; i <= count; i++) {
                        options.push(`<option value="${i}">${i}</option>`);
                    }
                    const inner = options.join('\n');
                    this.ayaFromSelector.innerHTML = inner;
                    this.ayaToSelector.innerHTML = inner;
                    this.ayaFromSelector.dispatchEvent(new Event('change'));
                }
            }
        });
        let isUpdating = false;
        const dispatchUpdateEvent = function () {
            const ev = new CustomEvent('update', {
                detail: this.quran.getAyatData(this.sura, this.ayaStart, this.ayaEnd)
            });
            this.dispatchEvent(ev);
        }.bind(this);
        this.ayaFromSelector.addEventListener('change', () => {
            if (isUpdating || !this.isReady) {
                return;
            }
            isUpdating = true;
            if (Number.isInteger(this.sura) && Number.isInteger(this.ayaStart) && Number.isInteger(this.ayaEnd)) {
                if (this.ayaStart > this.ayaEnd || !this.isRange) {
                    this.ayaToSelector.value = this.ayaStart;
                    this.ayaToSelector.dispatchEvent(new Event('change'));
                }
                dispatchUpdateEvent();
            }
            isUpdating = false;
        });
        this.ayaToSelector.addEventListener('change', () => {
            if (isUpdating || !this.isReady) {
                return;
            }
            isUpdating = true;
            if (Number.isInteger(this.sura) && Number.isInteger(this.ayaStart) && Number.isInteger(this.ayaEnd))
            {
                if (this.ayaStart > this.ayaEnd) {
                    this.ayaFromSelector.value = this.ayaEnd;
                    this.ayaFromSelector.dispatchEvent(new Event('change'));
                }
                dispatchUpdateEvent();
            }
            isUpdating = false;
        });
        this.isRangeToggle.addEventListener('change', e => {
            if (!this.isReady) {
                return;
            }
            this.isRange = this.isRangeToggle.checked;
            this.ayaToSelector.value = this.ayaStart;
            dispatchUpdateEvent();
        });
    }

    get sura() {
        return Number(this.suraSelector.value);
    }

    get ayaStart() {
        return Number(this.ayaFromSelector.value);
    }

    get ayaEnd() {
        return Number(this.ayaToSelector.value);
    }

    init(xmlDoc) {
        this.quran.quranXml = xmlDoc;
        const count = this.quran.getSuraCount();
        if (Number.isInteger(count)) {
            this.suraSelector.innerHTML = this.quran.getMetaData().map(s => {
                return `<option value="${s.id}">${s.id} - ${L11n.currentLocale === 'ar' ? s.name : s.englishName}</option>`
            }).join('\n');
            this.isReady = true;
            this.suraSelector.dispatchEvent(new Event('change'));
        }
    }

    loadState(state) {
        if (state) {
            this.isRangeToggle.checked = state.isRange;
            this.isRangeToggle.dispatchEvent(new Event('change'));
            this.suraSelector.value = state.sura;
            this.suraSelector.dispatchEvent(new Event('change'));
            this.ayaFromSelector.value = state.start;
            this.ayaFromSelector.dispatchEvent(new Event('change'));
            this.ayaToSelector.value = state.end;
            this.ayaToSelector.dispatchEvent(new Event('change'));
        }
    }
}

class ItemContext extends EventTarget {
    constructor(id, name, ayaSelector, isArabic = true) {
        super();

        this.id = id;
        this.name = name;
        this.isArabic = isArabic;
        this.element = new DragResizeItem();
        this.element.setAttribute('id', id);
        this.element.setAttribute('resize-horizontally-only', '');

        ayaSelector.addEventListener('update', e => {
            this.data = e.detail;
            this.reference?.updateText();
            this.updateText();
        });

        // init default values
        this.textColor = '#9c3f16';
        this.alignment = 'center';
        this.fontSize = isArabic ? 24 : 16;
        this.fontFamily = isArabic ? 'hafs' : 'Bitter';
        this.lineHeight = isArabic ? 1.75 : 1.625;
        this.element.style.direction = isArabic ? 'rtl' : 'ltr';
    }

    get rect() {
        return this.element.getRect();
    }

    get isReference() {
        return false;
    }

    get text() {
        return this.element.innerText;
    }

    get textColor() {
        return utils.colorToHex(this.element.style.color);
    }
    set textColor(color) {
        if (color) {
            this.element.style.color = color;
        }
    }

    get fontSize() {
        return Number(this.element.style.fontSize.match(/\d+/)[0]);
    }
    set fontSize(value) {
        value = Number(value);
        if (!Number.isNaN(value)) {
            this.element.style.fontSize = value + 'px';
        }
    }

    get fontFamily() {
        return this.element.style.fontFamily;
    }
    set fontFamily(font) {
        if (font) {
            this.element.style.fontFamily = font;
        }
    }

    get lineHeight() {
        return Number(this.element.style.lineHeight);
    }
    set lineHeight(value) {
        if (!Number.isNaN(value)) {
            this.element.style.lineHeight = value;
        }
    }

    get alignment() {
        return this.element.style.textAlign;
    }
    set alignment(value) {
        if (value === 'left' || value === 'center' || value === 'right') {
            this.element.style.textAlign = value;
        }
    }

    updateText() {
        this.element.innerHTML = this.data.ayat.map(a => this.isArabic ? a.text : a.englishText).join('0');
    }

    dump() {
        return {
            id: this.id,
            textColor: this.textColor,
            fontSize: this.fontSize,
            alignment: this.alignment,
            visible: document.contains(this.element),
            rect: this.rect,
        };
    }

    reloadConfig(config) {
        if (config) {
            this.textColor = config.textColor;
            this.fontSize = config.fontSize;
            this.alignment = config.alignment;
            this.element.setPosition(config.rect);
            this.element.setSize(config.rect);
        }
    }
}

class ArabicAyaItem extends ItemContext {
    constructor(ayaSelector) {
        super('arabic-txt', L11n.getString(L11n.Keys.ArabicText), ayaSelector, true);

        this.reference = null;
        this.includeNumbers = true;
        this.includeParentheses = false;
        this.includeSpaces = false;
        this.parentheses = '\ufd5f\ufd5e';
    }

    updateText() {
        const addNumbers = this.includeNumbers || this.data.ayat.length > 1;
        const parts = [];
        if (this.includeParentheses) {
            parts.push(this.parentheses[0]);
            if (this.includeSpaces) {
                parts.push(' ');
            }
        }
        let addSpace = false;
        for (let a of this.data.ayat) {
            let txt = addSpace ? ' ' : '';
            txt += a.text;
            if (addNumbers) {
                txt += '\u00a0' + utils.convertNum(a.id, '\u0660');
            }
            parts.push(txt);
            addSpace = true;
        }
        if (this.includeParentheses) {
            if (this.includeSpaces) {
                parts.push(' ');
            }
            parts.push(this.parentheses[1]);
        }
        if (this.reference) {
            if (this.reference.mode == 'Inline') {
                parts.push(' ' + this.reference.text);
            }
            else if (this.reference.mode == 'NewLine') {
                parts.push('\n' + this.reference.text);
            }
        }
        this.element.innerText = parts.join('');
    }

    dump() {
        const _dump = super.dump();
        _dump.includeNumbers = this.includeNumbers;
        _dump.includeParentheses = this.includeParentheses;
        _dump.includeSpaces = this.includeSpaces;
        _dump.parentheses = this.parentheses;
        return _dump;
    }

    reloadConfig(config) {
        if (config) {
            super.reloadConfig(config);
            this.includeNumbers = config.includeNumbers;
            this.includeParentheses = config.includeParentheses;
            this.includeSpaces = config.includeSpaces;
            this.parentheses = config.parentheses;
        }
    }
}

class EnglishTranslationItem extends ItemContext {
    constructor(ayaSelector) {
        super('english-txt', L11n.getString(L11n.Keys.EnglishTranslation), ayaSelector, false);

        this.reference = null;
        this.includeNumbers = true;
        this.fontSize = 16;
    }

    updateText() {
        const addNumbers = this.includeNumbers || this.data.ayat.length > 1;
        const parts = [];
        let addSpace = false;
        for (let a of this.data.ayat) {
            let txt = addSpace ? ' ' : '';
            txt += a.englishText;
            if (addNumbers) {
                txt += ' (' + a.id + ')';
            }
            parts.push(txt);
            addSpace = true;
        }
        if (this.reference) {
            if (this.reference.mode == 'Inline') {
                parts.push(' ' + this.reference.text);
            }
            else if (this.reference.mode == 'NewLine') {
                parts.push('\n' + this.reference.text);
            }
        }
        this.element.innerText = parts.join('');
    }

    dump() {
        const _dump = super.dump();
        _dump.includeNumbers = this.includeNumbers;
        return _dump;
    }

    reloadConfig(config) {
        if (config) {
            super.reloadConfig(config);
            this.includeNumbers = config.includeNumbers;
        }
    }
}

class AyaReferenceItem extends ItemContext {
    constructor(id, ayaSelector, isArabic) {
        super(id, L11n.getString(isArabic ? L11n.Keys.ArabicReference : L11n.Keys.EnglishReference), ayaSelector, isArabic);

        this.mode = 'None';
        this.includeBrackets = false;
    }

    get isReference() {
        return true;
    }

    get mode() {
        return this._mode;
    }
    set mode(value) {
        if (['None', 'Inline', 'NewLine', 'Isolated'].includes(value)) {
            this._mode = value;
            this.dispatchEvent(new Event('modeChanged'));
        }
    }

    get text() {
        return this.mode === 'None' ? '' : super.text;
    }

    updateText() {
        const parts = [];
        if (this.includeBrackets) {
            parts.push('[');
        }
        parts.push(this.isArabic ? this.data.sura.name : this.data.sura.englishName);
        parts.push(': ');
        if (this.data.ayat.length === 1) {
            parts.push(
                this.isArabic
                ? utils.convertNum(this.data.ayat[0].id)
                : this.data.ayat[0].id
                );
        }
        else {
            parts.push(
                this.isArabic
                ? utils.convertNum(this.data.ayat[0].id) + ' - ' + utils.convertNum(this.data.ayat[this.data.ayat.length - 1].id)
                : this.data.ayat[0].id + ' - ' + this.data.ayat[this.data.ayat.length - 1].id
                );
        }
        if (this.includeBrackets) {
            parts.push(']');
        }
        this.element.innerText = parts.join('');
    }

    dump() {
        const _dump = super.dump();
        _dump.mode = this.mode;
        _dump.includeBrackets = this.includeBrackets;
        return _dump;
    }

    reloadConfig(config) {
        if (config) {
            super.reloadConfig(config);
            this.mode = config.mode;
            this.includeBrackets = config.includeBrackets;
        }
    }
}

class BoardContext {
    constructor() {
        // init elements references
        this.element = document.getElementById('board');
        this.wrapper = document.getElementById('board-wrapper');
        this.colorInput = document.getElementById('board-color');
        this.widthInput = document.getElementById('board-width');
        this.heightInput = document.getElementById('board-height');
        this.imagePicker = document.getElementById('image-picker');
        this.loadButton = document.getElementById('load-btn');
        this.removeButton = document.getElementById('remove-btn');
        this.thumbnail = document.getElementById('image-thumbnail');

        this.minWidth = 128;
        this.minHeight = 92;

        // init listeners
        this.loadButton.addEventListener('click', () => {
            this.imagePicker.click();
        });
        this.removeButton.addEventListener('click', () => {
            URL.revokeObjectURL(this.image);
            this.imagePicker.value = null;
            this.image = null;
        });
        this.imagePicker.addEventListener('change', e => {
            if (e.target.files.length === 1) {
                const src = URL.createObjectURL(e.target.files[0]);
                const temp = new Image();
                temp.onload = () => {
                    if (temp.width < this.minWidth || temp.height < this.minHeight) {
                        this.imagePicker.value = null;
                        alert(L11n.getString(L11n.Keys.Error_InvalidImageSize_Body, this.minWidth, this.minHeight));
                    }
                    else {
                        this.image = {
                            src: src,
                            width: temp.width,
                            height: temp.height
                        };
                    }
                };
                temp.src = src;
            }
        });
        this.colorInput.addEventListener('input', e => {
            this.background = e.target.value;
        });
        this.widthInput.addEventListener('change', e => {
            this.width = e.target.valueAsNumber;
        });
        this.heightInput.addEventListener('change', e => {
            this.height = e.target.valueAsNumber;
        });

        // init default values
        this.widthInput.min = this.minWidth;
        this.heightInput.min = this.minHeight;

        this.width = 320;
        this.height = 200;
        this.background = "#ffffff"

        new ResizeObserver(() => this.invalidateWrapperSize())
            .observe(this.wrapper.parentElement);
    }

    get image() {
        return this.thumbnail.src;
    }
    set image(blob = {src, width, height}) {
        if (blob) {
            this.thumbnail.src = blob.src;
            this.width = blob.width;
            this.height = blob.height;
            this.element.style.backgroundImage = 'url(' + blob.src + ')';
            this.widthInput.disabled = true;
            this.heightInput.disabled = true;
        }
        else {
            this.widthInput.disabled = false;
            this.heightInput.disabled = false;
            this.thumbnail.removeAttribute('src');
            this.element.style.backgroundImage = null;
        }
    }

    get background() {
        return utils.colorToHex(this.element.style.backgroundColor);
    }
    set background(color) {
        if (color) {
            this.element.style.backgroundColor = color;
            if (this.colorInput.value != color) {
                this.colorInput.value = color;
            }
        }
    }

    get width() {
        if (this.element.style.width?.length) {
            return Number(this.element.style.width.match(/\d+/)[0]);
        }
         else {
            return null;
        }
    }
    set width(value) {
        if (Number.isInteger(value)) {
            value = value > this.minWidth ? value : this.minWidth;
            this.element.style.width = value + 'px';
            if (this.widthInput.valueAsNumber !== value) {
                this.widthInput.value = value;
            }
            this.invalidateWrapperSize();
        }
    }

    get height() {
        if (this.element.style.height?.length) {
            return Number(this.element.style.height.match(/\d+/)[0]);
        }
         else {
            return null;
        }
    }
    set height(value) {
        if (Number.isInteger(value)) {
            value = value > this.minHeight ? value : this.minHeight;
            this.element.style.height = value + 'px';
            if (this.heightInput.valueAsNumber != value) {
                this.heightInput.value = value;
            }
            this.invalidateWrapperSize();
        }
    }

    invalidateWrapperSize() {
        if (this.width === null || this.height === null) {
            return;
        }
        const wrapperStyle = getComputedStyle(this.wrapper);
        const padLeft = Number(wrapperStyle.paddingLeft.match(/\d+/)[0]);
        const padRight = Number(wrapperStyle.paddingRight.match(/\d+/)[0]);
        const padTop = Number(wrapperStyle.paddingTop.match(/\d+/)[0]);
        const padBottom = Number(wrapperStyle.paddingBottom.match(/\d+/)[0]);
        const parentWidth = this.wrapper.parentElement.clientWidth;
        const parentHeight = this.wrapper.parentElement.clientHeight;
        if (this.width + padLeft + padRight <= parentWidth) {
            this.wrapper.style.width = (parentWidth - padLeft - padRight) + 'px';
        }
        else {
            this.wrapper.style.width = (this.width + padLeft + padRight) + 'px';
        }
        if (this.height + padTop + padBottom <= parentHeight) {
            this.wrapper.style.height = (parentHeight - padTop - padBottom) + 'px';
        }
        else {
            this.wrapper.style.height = (this.height + padTop + padBottom) + 'px';
        }
    }
}

AppContext.default = new AppContext();

export default AppContext;