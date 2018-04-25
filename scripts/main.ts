import {enableReorder} from './components/reorder/reorder';

let list = document.querySelector<HTMLUListElement>('.number-list');

let disableReorder = enableReorder(list, "vertical", order => {
    console.log(order);
});