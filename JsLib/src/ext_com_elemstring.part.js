// ====================================================================
// 生成dom元素字符串,主要用于拼接html字符串的情况
// ====================================================================
((win) => {
    // help
    const $ = win.ns.jslib;
    let elems = ['div', 'span', 'a', 'p', 'table', 'tr', 'th', 'td', 'select', 'option', 'ul', 'li', 'dt', 'dd', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    let domStr = {};
    for (var i = 0, len = elems.length; i < len; i++) {
        let elem = elems[i]
        domStr[elem] = (text, classN, attrkv) => {
            if (typeof classN == 'object')
                return elestring(elem, text, null, classN)
            return elestring(elem, text, classN, attrkv)
        }
    }
    function elestring(elemN, text, classN, attrkv) {
        let cls = classN ? ` class="${classN}"` : '';
        let attrs = '';
        if (attrkv) {
            for (var k in attrkv) {
                attrs += ` ${k}="${attrkv[k]}"`;
            }
        }
        // 如果是数字的情况,调用.indexOf(':for')就出错,没有这个函数
        if (typeof text == "string" && text.indexOf(':for') == 0) {
            let txtarr = text.substring(4).split('|');
            let html = '';
            for (var i = 0, len = txtarr.length; i < len; i++) {
                let txt = txtarr[i];
                html += `<${elemN}${cls}${attrs}>${txt}</${elemN}>`;
            }
            return html;
        }
        return `<${elemN}${cls}${attrs}>${text}</${elemN}>`;
    }
    //
    $.dom = domStr;
})(window);