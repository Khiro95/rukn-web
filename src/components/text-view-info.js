import AppContext from "../app-context";

const appContext = AppContext.default;

const textViewInfoTemplate = document.getElementById('text-view-info-template');

class TextViewInfo extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(textViewInfoTemplate.content.cloneNode(true));

        this.addEventListener('click', () => {
            if (!this.sourceItem.isReference) {
                this.checked = !this.checked;
            }
        });
    }

    get checked() {
        return this.hasAttribute('checked');
    }
    set checked(value) {
        if (value === true) {
            this.setAttribute('checked', '');
            appContext.toggleItemVisibility(this.sourceItem, true);
            this.updateInfos(this.sourceItem.rect);
        }
        else {
            this.removeAttribute('checked');
            appContext.toggleItemVisibility(this.sourceItem, false);
        }
    }

    get source() {
        return this.attributes.source?.value;
    }

    connectedCallback() {
        if (!this.source) {
            return;
        }
        this.sourceItem = appContext.items.find(i => i.element.id == this.source);
        this.shadowRoot.querySelector('.tv-header').innerText = this.sourceItem.name;
        if (this.sourceItem.isReference) {
            this.shadowRoot.querySelector('.tv-checkmark').classList.add('disabled');
        }

        this.widthLabel = this.shadowRoot.querySelector('.tv-size-w');
        this.heightLabel = this.shadowRoot.querySelector('.tv-size-h');
        this.xLabel = this.shadowRoot.querySelector('.tv-pos-x');
        this.yLabel = this.shadowRoot.querySelector('.tv-pos-y');

        if (this.sourceItem.isReference) {
            this.sourceItem.addEventListener('modeChanged', e => {
                if (this.sourceItem.mode === 'Isolated') {
                    this.removeAttribute('hidden');
                    this.checked = true;
                }
                else {
                    this.setAttribute('hidden', '');
                    this.checked = false;
                }
            })
        }
        this.sourceItem.element.addEventListener('change', e => {
            this.updateInfos(e.detail);
        });
        this.sourceItem.element.addEventListener('selectionChanged', e => {
            if (this.sourceItem.element.selected) {
                this.setAttribute('selected', '');
            }
            else {
                this.removeAttribute('selected');
            }
        });
        this.shadowRoot.querySelector('.tv-reset-btn').addEventListener('click', e => {
            e.stopPropagation();
            this.sourceItem.element.setPosition({ x: 0, y: 0 });
        });
        // in case attribute was set manually
        this.checked = this.checked;

        if (this.sourceItem.isReference && this.sourceItem.mode !== 'Isolated') {
            this.setAttribute('hidden', '');
            this.checked = false;
        }
    }

    updateInfos(rect) {
        this.widthLabel.innerText = rect.width;
        this.heightLabel.innerText = rect.height;
        this.xLabel.innerText = rect.x;
        this.yLabel.innerText = rect.y;
    }
}

let isDefined = false;
if (!isDefined) {
    customElements.define('text-view-info', TextViewInfo);
    isDefined = true;
}

export default TextViewInfo;
