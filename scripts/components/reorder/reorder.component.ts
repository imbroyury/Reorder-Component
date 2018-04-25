import {ReorderType} from "./reorder";
import {IDropZone, IReorderOptions} from "./reorder.interfaces";

export class ReorderComponent {
    el: HTMLElement;
    type: ReorderType;
    callback: (reorder: Array<any>) => void;
    items: Map<any, HTMLElement>;
    reorderOptions: IReorderOptions;
    activated = false;

    constructor (el: HTMLElement, type: ReorderType) {
        this.el = el;
        this.type = type;
        this.items = getChildrenMap(this.el);
        this.el.addEventListener('mousedown', this);
    }

    handleEvent(e: MouseEvent) {
        switch (e.type) {
            case 'mousedown':
                return this.onMouseDown(e);
            case 'mousemove':
                return this.onMouseMove(e);
            case 'mouseup':
                return this.onMouseUp(e);
        }
    }

    onMouseDown(e: MouseEvent) {
        e.preventDefault();
        let item = (e.target as HTMLElement).closest('[data-value]') as HTMLElement,
            itemRect = item.getBoundingClientRect(),
            x = e.pageX - itemRect.left,
            y = e.pageY - itemRect.top,
            dropZones = [];
        for (let [value, el] of this.items.entries()) {
            let rect = el.getBoundingClientRect();
            dropZones.push({value, rect});
        }
        this.reorderOptions = {
            item,
            offset: {x,y},
            dropZones
        };
        console.log(this.reorderOptions);
        document.addEventListener('mousemove', this);
        document.addEventListener('mouseup', this);
    }

    onMouseMove(e: MouseEvent) {
        let {item, offset} = this.reorderOptions,
            x = e.pageX - offset.x,
            y = e.pageY - offset.y;
        if (this.activated) {
            requestAnimationFrame(() => {
                let [index] = getDropZone(e.pageX, e.pageY, this.reorderOptions);
                if (index > -1) {
                    removeDropZoneHighlight(this.el);
                    addDropZoneHighlight(this.el, index);
                }
                item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
        } else {
            if (detectMovement(e)) {
                extractElement(item, x, y, () => this.activated = true);
            }
        }

    }

    onMouseUp(e: MouseEvent) {
        if (this.activated) {
            let [index, dropZone] = getDropZone(e.pageX, e.pageY, this.reorderOptions),
                {item} = this.reorderOptions;
            if (dropZone) {
                moveToDropZone(item, dropZone).then(() => {
                    requestAnimationFrame(() => {
                        removeCurrentStyles(item);
                        removeDropZoneHighlight(this.el, true);
                        this.el.insertBefore(item, this.el.children.item(index));
                        this.items = getChildrenMap(this.el);
                        this.callback([...this.items.keys()]);
                    });
                });
            }
        }
        this.activated = false;
        document.removeEventListener('mousemove', this);
        document.removeEventListener('mouseup', this);
    }

    onReorder(callback: (reorder: Array<any>) => void) {
        this.callback = callback;
    }

    destroy() {
        this.el.removeEventListener('mousedown', this);
    }
}

function removeDropZoneHighlight(el: HTMLElement, noAnimation = false) {
    let oldEl = el.querySelector('.insert-before'),
        classes = ['insert-before'];
    if (noAnimation) {
        classes.push('highlight');
    }
    oldEl && oldEl.classList.remove(...classes);
}

function addDropZoneHighlight(el: HTMLElement, childIndex, noAnimation = false) {
    let newEl = el.children.item(childIndex),
        classes = ['insert-before'];
    if(!noAnimation) {
        classes.push('highlight');
    }
    newEl && newEl.classList.add(...classes);
}

function getChildrenMap (el: HTMLElement): Map<any, HTMLElement> {
    let map = new Map();
    for (let itemEl of el.children) {
        map.set((itemEl as HTMLElement).dataset.value, itemEl);
    }
    return map;
}

function detectMovement(e: MouseEvent): boolean {
    return !!(e.movementX || e.movementY);
}

function setCurrentStyles(el: HTMLElement) {
    el.style.cssText = getComputedStyle(el).cssText;
    el.classList.add('extracted');
}

function removeCurrentStyles(el: HTMLElement) {
    el.style.cssText = '';
    el.classList.remove('extracted', 'animated');
}

function extractElement(el: HTMLElement, x, y, callback: Function) {
    requestAnimationFrame(() => {
        setCurrentStyles(el);
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        let nextElement = el.nextElementSibling;
        if (nextElement) {
            nextElement.classList.add('insert-before');
        }
        document.body.appendChild(el);
        callback();
    });
}

function getDropZone(x, y, {item, dropZones}: IReorderOptions): [number, IDropZone] {
    let dropZone = dropZones.find(({rect}) => {
       return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
    });
    if (!dropZone) {
        let value = item.dataset.value;
        dropZone = dropZones.find(zone => zone.value === value);
    }
    return [dropZones.indexOf(dropZone), dropZone];
}

function moveToDropZone(el: HTMLElement, dropZone: IDropZone): Promise<void> {
    const translate3dRegEx = /translate3d\((-?\d*(?:\.\d+)?)(?:px)?, (-?\d*(?:\.\d+)?)(?:px)?, (-?\d*(?:\.\d+)?)(?:px)?\)/;
    return new Promise(resolve => {
        let [, sx, sy] = translate3dRegEx.exec(el.style.transform),
            {left, top} = dropZone.rect,
            x = Number(sx),
            y = Number(sy);
        el.classList.add('animated');
        el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        if (Math.floor(x) === Math.floor(left) && Math.floor(y) === Math.floor(top)) {
            resolve();
        } else {
            el.addEventListener('transitionend', () => resolve(), {once: true});
        }
    });
}