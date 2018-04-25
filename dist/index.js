/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./scripts/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./scripts/components/reorder/reorder.component.ts":
/*!*********************************************************!*\
  !*** ./scripts/components/reorder/reorder.component.ts ***!
  \*********************************************************/
/*! exports provided: ReorderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReorderComponent", function() { return ReorderComponent; });
class ReorderComponent {
    constructor(el, type) {
        this.activated = false;
        this.el = el;
        this.type = type;
        this.items = getChildrenMap(this.el);
        this.el.addEventListener('mousedown', this);
    }
    handleEvent(e) {
        switch (e.type) {
            case 'mousedown':
                return this.onMouseDown(e);
            case 'mousemove':
                return this.onMouseMove(e);
            case 'mouseup':
                return this.onMouseUp(e);
        }
    }
    onMouseDown(e) {
        e.preventDefault();
        let item = e.target.closest('[data-value]'), itemRect = item.getBoundingClientRect(), x = e.pageX - itemRect.left, y = e.pageY - itemRect.top, dropZones = [];
        for (let [value, el] of this.items.entries()) {
            let rect = el.getBoundingClientRect();
            dropZones.push({ value, rect });
        }
        this.reorderOptions = {
            item,
            offset: { x, y },
            dropZones
        };
        console.log(this.reorderOptions);
        document.addEventListener('mousemove', this);
        document.addEventListener('mouseup', this);
    }
    onMouseMove(e) {
        let { item, offset } = this.reorderOptions, x = e.pageX - offset.x, y = e.pageY - offset.y;
        if (this.activated) {
            requestAnimationFrame(() => {
                let [index] = getDropZone(e.pageX, e.pageY, this.reorderOptions);
                if (index > -1) {
                    removeDropZoneHighlight(this.el);
                    addDropZoneHighlight(this.el, index);
                }
                item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
        }
        else {
            if (detectMovement(e)) {
                extractElement(item, x, y, () => this.activated = true);
            }
        }
    }
    onMouseUp(e) {
        if (this.activated) {
            let [index, dropZone] = getDropZone(e.pageX, e.pageY, this.reorderOptions), { item } = this.reorderOptions;
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
    onReorder(callback) {
        this.callback = callback;
    }
    destroy() {
        this.el.removeEventListener('mousedown', this);
    }
}
function removeDropZoneHighlight(el, noAnimation = false) {
    let oldEl = el.querySelector('.insert-before'), classes = ['insert-before'];
    if (noAnimation) {
        classes.push('highlight');
    }
    oldEl && oldEl.classList.remove(...classes);
}
function addDropZoneHighlight(el, childIndex, noAnimation = false) {
    let newEl = el.children.item(childIndex), classes = ['insert-before'];
    if (!noAnimation) {
        classes.push('highlight');
    }
    newEl && newEl.classList.add(...classes);
}
function getChildrenMap(el) {
    let map = new Map();
    for (let itemEl of el.children) {
        map.set(itemEl.dataset.value, itemEl);
    }
    return map;
}
function detectMovement(e) {
    return !!(e.movementX || e.movementY);
}
function setCurrentStyles(el) {
    el.style.cssText = getComputedStyle(el).cssText;
    el.classList.add('extracted');
}
function removeCurrentStyles(el) {
    el.style.cssText = '';
    el.classList.remove('extracted', 'animated');
}
function extractElement(el, x, y, callback) {
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
function getDropZone(x, y, { item, dropZones }) {
    let dropZone = dropZones.find(({ rect }) => {
        return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
    });
    if (!dropZone) {
        let value = item.dataset.value;
        dropZone = dropZones.find(zone => zone.value === value);
    }
    return [dropZones.indexOf(dropZone), dropZone];
}
function moveToDropZone(el, dropZone) {
    const translate3dRegEx = /translate3d\((-?\d*(?:\.\d+)?)(?:px)?, (-?\d*(?:\.\d+)?)(?:px)?, (-?\d*(?:\.\d+)?)(?:px)?\)/;
    return new Promise(resolve => {
        let [, sx, sy] = translate3dRegEx.exec(el.style.transform), { left, top } = dropZone.rect, x = Number(sx), y = Number(sy);
        el.classList.add('animated');
        el.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        if (Math.floor(x) === Math.floor(left) && Math.floor(y) === Math.floor(top)) {
            resolve();
        }
        else {
            el.addEventListener('transitionend', () => resolve(), { once: true });
        }
    });
}


/***/ }),

/***/ "./scripts/components/reorder/reorder.ts":
/*!***********************************************!*\
  !*** ./scripts/components/reorder/reorder.ts ***!
  \***********************************************/
/*! exports provided: enableReorder */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enableReorder", function() { return enableReorder; });
/* harmony import */ var _reorder_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reorder.component */ "./scripts/components/reorder/reorder.component.ts");

function enableReorder(el, type, callback) {
    let reorder = new _reorder_component__WEBPACK_IMPORTED_MODULE_0__["ReorderComponent"](el, type);
    reorder.onReorder(callback);
    return function () {
        reorder.destroy();
    };
}


/***/ }),

/***/ "./scripts/main.ts":
/*!*************************!*\
  !*** ./scripts/main.ts ***!
  \*************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_reorder_reorder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/reorder/reorder */ "./scripts/components/reorder/reorder.ts");

let list = document.querySelector('.number-list');
let disableReorder = Object(_components_reorder_reorder__WEBPACK_IMPORTED_MODULE_0__["enableReorder"])(list, "vertical", order => {
    console.log(order);
});


/***/ })

/******/ });
//# sourceMappingURL=index.js.map