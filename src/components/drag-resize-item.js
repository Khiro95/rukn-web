const dragResizeItemTemplate = document.getElementById('drag-resize-item-template');

class DragResizeItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(dragResizeItemTemplate.content.cloneNode(true));

        this._slot = this.shadowRoot.querySelector('slot');
    }

    get resizeHorizontallyOnly() {
        return this.hasAttribute('resize-horizontally-only');
    }

    set resizeHorizontallyOnly(value) {
        if (value) {
            this.setAttribute('resize-horizontally-only', '');
        }
        else {
            this.removeAttribute('resize-horizontally-only');
        }
    }

    get selected() {
        return this.hasAttribute('selected');
    }

    set selected(value) {
        if (value) {
            this.focus();
        }
        if (value === this.selected) {
            return;
        }
        if (value) {
            this.setAttribute('selected', '');
        }
        else {
            this.removeAttribute('selected');
        }
        this.dispatchEvent(new Event('selectionChanged'))
    }

    get minSize() {
        return 20;
    }

    connectedCallback() {
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;
        const dragFunc = e => {
            if (window.TouchEvent && e instanceof TouchEvent) {
                e = e.changedTouches[0];
            }
            drag.call(this, e.pageX, e.pageY);
        };
        const dragStart = e => {
            const isTouch = window.TouchEvent && e instanceof TouchEvent;
            if (!e.cancelable || (isTouch && e.changedTouches.length > 1)) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            this.selected = true;
            original_x = this.offsetLeft;
            original_y = this.offsetTop;
            let moveEvent = 'mousemove',
                endEvent = "mouseup";
            if (isTouch) {
                e = e.changedTouches[0];
                moveEvent = 'touchmove';
                endEvent = 'touchend';
            }
            original_mouse_x = e.pageX;
            original_mouse_y = e.pageY;
            window.addEventListener(moveEvent, dragFunc);
            window.addEventListener(endEvent, stopDragging);
        };

        this.addEventListener('mousedown', dragStart);
        this.addEventListener('touchstart', dragStart);

        function drag(pageX, pageY) {
            this.setPosition({
                x: original_x + (pageX - original_mouse_x),
                y: original_y + (pageY - original_mouse_y)
            });
        }

        function stopDragging() {
            window.removeEventListener('mousemove', dragFunc);
            window.removeEventListener('touchmove', dragFunc);
        };

        this.addEventListener('keydown', e => {
            if (!this.selected || !['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'].includes(e.code)) {
                return;
            }
            e.preventDefault();
            let xShift = 0,
                yShift = 0;
            const step = e.shiftKey ? 10 : 1;
            switch (e.code) {
                case 'ArrowUp':
                    yShift = -step;
                    break;
                case 'ArrowDown':
                    yShift = step;
                    break;
                case 'ArrowRight':
                    xShift = step;
                    break;
                case 'ArrowLeft':
                    xShift = -step;
                    break;
            }
            this.setPosition({
                x: this.offsetLeft + xShift,
                y: this.offsetTop + yShift
            });
        });

        const resizers = this.shadowRoot.querySelectorAll('.resizer,.resizer-edge')
        const minimum_size = this.minSize;
        let original_width = 0;
        let original_height = 0;
        const resizeFunc = resize.bind(this);
        const resizeStart = (e, currentResizer) => {
            const isTouch = window.TouchEvent && e instanceof TouchEvent;
            if (!e.cancelable || (isTouch && e.changedTouches.length > 1)) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            this.selected = true;
            original_width = this.getBoundingClientRect().width;
            original_height = this.getBoundingClientRect().height;
            original_x = this.offsetLeft;
            original_y = this.offsetTop;
            let moveEvent = 'mousemove',
                endEvent = "mouseup";
            if (isTouch) {
                e = e.changedTouches[0];
                moveEvent = 'touchmove';
                endEvent = 'touchend';
            }
            original_mouse_x = e.pageX;
            original_mouse_y = e.pageY;
            const func = e => {
                if (window.TouchEvent && e instanceof TouchEvent) {
                    e = e.changedTouches[0];
                }
                resizeFunc(e.pageX, e.pageY, currentResizer);
            }
            window.addEventListener(moveEvent, func);
            window.addEventListener(endEvent, () => stopResize(func));
        };
        for (let i = 0; i < resizers.length; i++) {
            const currentResizer = resizers[i];
            currentResizer.addEventListener('mousedown', e => resizeStart(e, currentResizer));
            currentResizer.addEventListener('touchstart', e => resizeStart(e, currentResizer));
        }
        function resize(pageX, pageY, currentResizer) {
            if (currentResizer.classList.contains('top')) {
                const height = original_height - (pageY - original_mouse_y)
                if (height > minimum_size) {
                    this.style.height = height + 'px'
                    this.style.top = original_y + (pageY - original_mouse_y) + 'px'
                }
            }
            else if (currentResizer.classList.contains('bottom')) {
                const height = original_height + (pageY - original_mouse_y)
                if (height > minimum_size) {
                    this.style.height = height + 'px'
                }
            }
            if (currentResizer.classList.contains('right')) {
                const width = original_width + (pageX - original_mouse_x)
                if (width > minimum_size) {
                    this.style.width = width + 'px'
                }
            }
            else if (currentResizer.classList.contains('left')) {
                const width = original_width - (pageX - original_mouse_x)
                if (width > minimum_size) {
                    this.style.width = width + 'px'
                    this.style.left = original_x + (pageX - original_mouse_x) + 'px'
                }
            }
        }
        function stopResize(func) {
            window.removeEventListener('mousemove', func);
            window.removeEventListener('touchmove', func);
        }

        this.addEventListener('dblclick', e => {
            e.stopPropagation();
            let width = 0;
            let height = 0;

            // assuming there is no inline element
            for (let node of this._slot.assignedNodes()) {
                if (node instanceof HTMLBRElement) {
                    continue;
                }
                let rect = node.getBoundingClientRect?.();
                if (node instanceof Text) {
                    let text = document.createRange();
                    text.selectNodeContents(node);
                    rect = text.getBoundingClientRect();
                }
                if (rect) {
                    height += rect.height;
                    if (rect.width > width) {
                        width = rect.width;
                    }
                }
            }
            const rect = this.getBoundingClientRect();

            let diff = rect.width - width;
            this.style.width = Math.ceil(width) + 'px';
            let offset = 0;
            if (this.style.textAlign === 'center') {
                offset = Math.ceil(diff / 2);
            }
            else if (this.style.textAlign === 'right') {
                offset = diff;
            }
            this.style.left = this.offsetLeft + offset + 'px';

            diff = rect.height - height;
            this.style.height = Math.ceil(height) + 'px';
            this.style.top = this.offsettop + Math.ceil(diff / 2) + 'px';
        });

        new ResizeObserver(this.dispatchChangeEvent.bind(this)).observe(this);

        this.tabIndex = 0;
    }

    setPosition(pos = { x: 0, y: 0 }) {
        if (pos) {
            let changed = false;
            if (typeof pos.x === 'number') {
                this.style.left = pos.x + 'px';
                changed = true;
            }
            if (typeof pos.y === 'number') {
                this.style.top = pos.y + 'px';
                changed = true;
            }
            if (changed) {
                this.dispatchChangeEvent();
            }
        }
    }

    setSize(size = { width: 0, height: 0 }) {
        if (size) {
            let changed = false;
            if (typeof size.width === 'number' && size.width > 0) {
                this.style.width = (size.width < this.minSize ? this.minSize : size.width) + 'px';
                changed = true;
            }
            if (typeof size.height === 'number' && size.height > 0) {
                this.style.height = (size.height < this.minSize ? this.minSize : size.height) + 'px';
                changed = true;
            }
            if (changed) {
                this.dispatchChangeEvent();
            }
        }
    }

    getRect() {
        const { width, height } = this.getBoundingClientRect();
        return {
            x: this.offsetLeft,
            y: this.offsetTop,
            width,
            height
        };
    }

    dispatchChangeEvent() {
        const ev = new CustomEvent('change', { detail: this.getRect() });
        this.dispatchEvent(ev);
    }
}

let isDefined = false;
if (!isDefined) {
    customElements.define('drag-resize', DragResizeItem);
    isDefined = true;
}

export default DragResizeItem;