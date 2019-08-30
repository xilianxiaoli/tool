export default {
    hasClass(el: any, token: any) {
        return new RegExp('(\\s|^)' + token + '(\\s|$)').test(el.className);
    },
    addClass(el: any, token: any) {
        if (!el) {
            return;
        }
        if (el.classList) {
            el.classList.add(token);
        } else if (!this.hasClass(el, token)) {
            el.className += '' + token;
        }
    },
    removeClass(el: any, token: any) {
        if (!el) {
            return;
        }
        if (el.classList) {
            el.classList.remove(token);
        } else if (this.hasClass(el, token)) {
            el.className = el.className.replace(new RegExp('(\\s|^)' + token + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
        }
    },
    getRect(el: any) {
        if (el instanceof (window as any).SVGElement) {
            const rect = el.getBoundingClientRect();
            return {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            };
        } else {
            return {
                top: el.offsetTop,
                left: el.offsetLeft,
                width: el.offsetWidth,
                height: el.offsetHeight
            };
        }
    },
    addEvent(el: any, event: string, handler: any) {
        if (!el) {
            return;
        }
        if (el.attachEvent) {
            el.attachEvent('on' + event, handler);
        } else if (el.addEventListener) {
            el.addEventListener(event, handler, true);
        } else {
            el['on' + event] = handler;
        }
    },
    removeEvent(el: any, event: string, handler: any) {
        if (!el) {
            return;
        }
        if (el.detachEvent) {
            el.detachEvent('on' + event, handler);
        } else if (el.removeEventListener) {
            el.removeEventListener(event, handler, true);
        } else {
            el['on' + event] = null;
        }
    }

};
