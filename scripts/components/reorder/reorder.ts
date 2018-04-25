import {ReorderComponent} from "./reorder.component";

type ReorderType = 'vertical' | 'horizontal';

export {
    ReorderType
}

export function enableReorder(el: HTMLElement, type: ReorderType, callback: (order: Array<any>) => void): Function {
    let reorder = new ReorderComponent(el, type);
    reorder.onReorder(callback);
    return function () {
        reorder.destroy();
    }
}