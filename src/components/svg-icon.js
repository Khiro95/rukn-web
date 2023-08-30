const svgIconTemplate = document.getElementById('svg-icon-template');

class SvgIcon extends HTMLElement {
    constructor() {
        super();

        this.style.display = "inline-flex";

        if (this.key) {
            this.appendChild(svgIconTemplate.content.cloneNode(true));
            this.querySelector('use').href.baseVal += `#${this.key}`;
        }
    }

    get key() {
        return this.attributes.key?.value;
    }
}

let isDefined = false;
if (!isDefined) {
    customElements.define('svg-icon', SvgIcon);
    isDefined = true;
}

export default SvgIcon;