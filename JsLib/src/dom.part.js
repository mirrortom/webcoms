// ==================================================
// 辅助方法 只在这密闭函数内能用
// ==================================================
/**
 * 查找parent.querySelectorAll(),返回元素列表filterList.提供mixNodeList时,返回两个列表交集.(同时在两个列表中的元素)
 * @param {HTMLElement} parent 要查找的元素
 * @param {string} selector 选择器
 * @param {any} mixNodeList 取交集的元素列表
 * @returns {any} 返回元素列表
 */
let _filterMix = (parent, selector, mixNodeList) => {
    // querySelectorAll()找到的元素可能包含后代元素而不仅仅是子元素
    let filterlist = parent.querySelectorAll(selector);
    if (!mixNodeList)
        return filterlist;
    // 交集
    let matched = [];
    filterlist.forEach((finditem) => {
        mixNodeList.forEach((childitem) => {
            if (childitem === finditem)
                matched.push(childitem);
        });
    });
    return matched;
};
/**
 * 返回指定元素的所有同级元素.dir限定返回所有元素的一个子集
 * @param {HTMLElement} elem 指定元素
 * @param {string} dir 限定参数 nextAll(之后所有) | prevAll(之前所有) (默认返回所有的同级元素)
 * @returns {any} 返回元素列表
 */
let _siblings = (elem, dir) => {
    var matched = [];
    if (dir === 'nextAll') {
        for (let sib = elem.nextSibling; sib; sib = sib.nextSibling) {
            if (sib.nodeType === 1)
                matched.push(sib);
        }
    } else if (dir === 'prevAll') {
        // previousSibling得到的元素顺序是倒的,加入元素时,用unshift()
        for (let sib = elem.previousSibling; sib; sib = sib.previousSibling) {
            if (sib.nodeType === 1)
                matched.unshift(sib);
        }
    }
    else {
        elem.parentNode.childNodes.forEach((childitem) => {
            if (childitem.nodeType === 1 && childitem !== elem)
                matched.push(childitem);
        });
    }

    return matched;
};
/**
 * 解析html字符串,变成DOM元素后,装入fragment对象.可以在onReady方法上使用这个fragment对象.
 * 由于innerhtml中包含的script不能执行,分析html字符串时,对script标签会重新生成.外联的script会发请求取js,然后变成内联的.
 * 最后生成一个包含解析后的html元素的DocumentFragment对象.
 * @param {any} onReady 解析完成后执行
 * @param {string|any} val html字符串,DocumentFragment对象或者node对象,nodelist对象
 */
let _parseHtml = (val, onReady) => {
    let framgSource;
    if (typeof val === 'string') {
        let range = document.createRange();
        framgSource = range.createContextualFragment(val);
    } else if (val instanceof DocumentFragment) {
        framgSource = val;
    } else if (val.length) {
        framgSource = document.createDocumentFragment();
        framgSource.append(...val);
    } else {
        framgSource = document.createDocumentFragment();
        framgSource.append(val);
    }
    // 放入fragment.(解析放入)
    let fragment = document.createDocumentFragment();
    _parseHtmlNodeLoad(fragment, framgSource, onReady);
};
/**
 * 递归将fromFragm里的node节点移动到fragment,完成后执行onReady.(这个方法用于_parseHtml()方法辅助)
 * @param {DocumentFragment} toFragm fragment容器对象
 * @param {DocumentFragment} fromFragm 源dom容器
 * @param {Function} onReady 完成后执行
 */
let _parseHtmlNodeLoad = (toFragm, fromFragm, onReady) => {
    if (fromFragm.firstChild === null) {
        onReady(toFragm);
        return;
    }
    // script元素.设置到innerhtml时不会执行,要新建一个script对象,再添加
    if (fromFragm.firstChild.nodeName === 'SCRIPT') {
        let newScript = document.createElement('script');
        let src = fromFragm.firstChild.src;
        if (src) {
            // 外联的script,要加载下来,否则有执行顺序问题.外联的没有加载完,内联的就执行了.如果内联js依赖外联则出错.
            // 这个办法是获取js脚本,是设置到生成的script标签中.(变成内联的了)
            fetch(src).then(res => res.text())
                .then((js) => {
                    newScript.innerHTML = js;
                    toFragm.append(newScript);
                    fromFragm.removeChild(fromFragm.firstChild);
                    _parseHtmlNodeLoad(toFragm, fromFragm, onReady);
                });
        } else {
            // 内联的直接设置innerHtml
            newScript.innerHTML = fromFragm.firstChild.innerHTML;
            toFragm.append(newScript);
            fromFragm.removeChild(fromFragm.firstChild);
            _parseHtmlNodeLoad(toFragm, fromFragm, onReady);
        }
    } else {
        // 其它元素
        toFragm.append(fromFragm.firstChild);
        _parseHtmlNodeLoad(toFragm, fromFragm, onReady);
    }
};
// ==================================================
// jslib实例方法 选择器
// ==================================================
factory.extend({
    /**
     * 以已经匹配的元素为根,查找子元素.(原生: dom.querySelectorAll())
     * @param {string} selector css选择器.如果选择器错误,会报异常.
     * @returns {jslib} 返回this
     */
    'find': function (selector) {
        let matched = [];
        this.each((item) => {
            let nodelist = item.querySelectorAll(selector);
            nodelist.forEach((finditem) => {
                matched.push(finditem);
            });
        });
        // 重置已选元素
        return this.reset(matched);
    },
    /**
     * 筛选取匹配元素的第n个元素(模拟jquery的eq()筛选方法)
     * @param {number} index 下标
     * @returns {jslib} 返回this
     */
    'eq': function (index) {
        this[0] = this[index];
        Array.prototype.splice.call(this, 1);
        return this;
    },
    /**
     * 返回第一个匹配元素在父元素中的索引.(模拟jquery的index())
     * @returns {number} 索引
     */
    'index': function () {
        return Array.prototype.indexOf.call(this[0].parentNode.children, this[0]);
    },
    /**
     * 查找所有匹配元素的同级元素,不包含匹配元素自己.(原生:)
     * @param {string} selector css选择器.如果选择器错误,会报异常.
     * @returns {jslib} 返回this
     */
    'siblings': function (selector) {
        let matched = [];
        this.each((item) => {
            // 找出所有同级节点,排除自己,排除非html节点
            let sibnodes = _siblings(item);
            // 有筛选时
            if (typeof selector === 'string') {
                matched = matched.concat(_filterMix(item.parentNode, selector, sibnodes));
            } else {
                matched = matched.concat(sibnodes);
            }
        });
        // 重置已选元素
        return this.reset(matched);
    },
    /**
     * 查找所有匹配元素的后面一个同辈元素,不指定筛选时返回紧邻的后一个元素.(原生:node.nextSibling)
     * @param {string} selector css选择器.如果选择器错误,会报异常.
     * @returns {jslib} 返回this
     */
    'next': function (selector) {
        let matched = [];
        this.each((item) => {
            // 找出自己之后的所有同级节点,排除自己,排除非html节点
            let sibnodes = _siblings(item, 'nextAll');
            // 有筛选时
            if (typeof selector === 'string') {
                let mixnodes = _filterMix(item.parentNode, selector, sibnodes);
                if (mixnodes[0])
                    matched.push(mixnodes[0]);
            } else {
                if (sibnodes[0])
                    matched.push(sibnodes[0]);
            }
        });
        // 重置已选元素
        return this.reset(matched);
    },
    /**
     * 查找所有匹配元素之后所有的同辈元素.(原生:)
     * @param {string} selector css选择器.如果选择器错误,会报异常.
     * @returns {jslib} 返回this
     */
    'nextAll': function (selector) {
        let matched = [];
        this.each((item) => {
            // 找出自己之后的所有同级节点,排除自己,排除非html节点
            let sibnodes = _siblings(item, 'nextAll');
            // 有筛选时
            if (typeof selector === 'string') {
                matched = matched.concat(_filterMix(item.parentNode, selector, sibnodes));
            } else {
                matched = matched.concat(sibnodes);
            }
        });
        // 重置已选元素
        return this.reset(matched);
    },
    /**
     * 查找所有匹配元素的紧邻的前面那一个同辈元素.(原生:node.previousSibling)
     * @param {string} selector css选择器.如果选择器错误,会报异常.
     * @returns {jslib} 返回this
     */
    'prev': function (selector) {
        let matched = [];
        this.each((item) => {
            // 找出自己之后的所有同级节点,排除自己,排除非html节点
            let sibnodes = _siblings(item, 'prevAll');
            // 有筛选时
            if (typeof selector === 'string') {
                let mixnodes = _filterMix(item.parentNode, selector, sibnodes);
                if (mixnodes[0])
                    matched.push(mixnodes[0]);
            } else {
                let prevNode = sibnodes[sibnodes.length - 1];
                if (prevNode)
                    matched.push(prevNode);
            }
        });
        // 重置已选元素
        return this.reset(matched);
    },
    /**
     * 查找所有匹配元素之后所有的同辈元素.(原生:)
     * @param {string} selector css选择器.如果选择器错误,会报异常.
     * @returns {jslib} 返回this
     */
    'prevAll': function (selector) {
        let matched = [];
        this.each((item) => {
            // 找出自己之后的所有同级节点,排除自己,排除非html节点
            let sibnodes = _siblings(item, 'prevAll');
            // 有筛选时
            if (typeof selector === 'string') {
                matched = matched.concat(_filterMix(item.parentNode, selector, sibnodes));
            } else {
                matched = matched.concat(sibnodes);
            }
        });
        // 重置已选元素
        return this.reset(matched);
    },
    /**
     * 返回每个匹配元素的一个父元素或者祖先元素.不传参数时,返回父元素.(原生: closest(selector))
     * @param {string} selector css选择器.如果选择器错误,会报异常.
     * @returns {jslib} 返回this
     */
    'parent': function (selector) {
        let matched = [];
        this.each((item) => {
            // 不传参数时, 返回父元素
            if (selector === undefined) {
                matched.push(item.parentNode);
                return true;
            }
            let p = item.parentNode.closest(selector);
            matched.push(p);
        });
        // 重置已选元素
        return this.reset(matched);
    },
    /**
     * 设置每个匹配元素的属性或返回第一个元素的属性值.(原生: getAttribute(),setAttribute())
     * @param {string|object} key 属性名或属性名~值对的json对象
     * @param {string} val 属性值
     * @returns {jslib} 取属性时返回属性值.否则返回this
     */
    'prop': function (key, val) {
        if (typeof key === 'string') {
            // 获取第0个
            if (val === undefined) {
                if (!this[0]) return;
                return this[0].getAttribute(key);
            }
            // 设置单个属性
            this.each((dom) => {
                dom.setAttribute(key, val);
            });
        } else if (typeof key === 'object') {
            // 设置多个属性
            this.each((dom) => {
                for (var k in key) {
                    dom.setAttribute(k, key[k]);
                }
            });
        }
        return this;
    },
    /**
     * 设置每个匹配元素的value属性或返回第一个元素的value属性值.主要用于input,textarea,select等表单元素(原生: ele.value)
     * @param {string} val 属性值
     * @returns {jslib} 取属性时返回属性值.否则返回this
     */
    'val': function (val) {
        if (val === undefined) {
            // 获取第0个
            if (!this[0]) return;
            return this[0].value;
        } else {
            // 设置所有元素value属性
            this.each((dom) => {
                dom.value = val;
            });
            return this;
        }
    },
    /**
     * 删除每个匹配的元素指定的属性
     * @param {string[]} key 属性名,一个或多个
     * @returns {jslib} return this
     */
    'removeProp': function (...key) {
        this.each((dom) => {
            for (var i = 0, len = key.length; i < len; i++) {
                dom.removeAttribute(key[i]);
            }
        });
        return this;
    },
    /**
     * 为每个匹配的元素添加指定的类名.(原生: classList.add())
     * @param {string[]} val 样式类名字,不定个数参数
     * @returns {jslib} return this
     */
    'addClass': function (...val) {
        let tmp = [];
        val.forEach((item) => {
            if (item)
                tmp.push(item);
        });
        this.each((item) => {
            item.classList.add(...tmp);
        });
        return this;
    },
    /**
     * 从所有匹配的元素中删除全部或者指定的类.(原生: classList.remove())
     * @param {string[]} val 样式类名字,不定个数参数.如果不传,删除所有样式
     * @returns {jslib} 返回this
     */
    'removeClass': function (...val) {
        if (val.length === 0) {
            this.each((item) => {
                item.setAttribute('class', '');
            });
        }
        let tmp = [];
        val.forEach((item) => {
            if (item)
                tmp.push(item);
        });
        this.each((item) => {
            item.classList.remove(...tmp);
        });
        return this;
    },
    /**
     * 检查第一个匹配的元素是否含有指定的类(原生: classList.contains)
     * @param {string} val  样式类名字
     * @returns {boolean} 第一个匹配含有类时返回true,其它情况返回false
     */
    'hasClass': function (val) {
        if (this.length > 0) {
            return this[0].classList.contains(val);
        }
        return false;
    },
    /**
     * 设置所有匹配的元素的innerText.无参数时,返回第一个元素的innerText内容(原生: innerText)
     * @param {string} val 设置的文本
     * @returns {jslib} 取值时返回值.否则返回this
     */
    'text': function (val) {
        if (val === undefined) {
            if (!this[0]) return;
            return this[0].innerText;
        }
        this.each((dom) => {
            dom.innerText = val;
        });
        return this;
    },
    /**
     * 设置所有匹配的元素的innerHTML属性.如果html中,含有script时,会重新生成script标签再加入文档中
     * 无参数时,返回第一个元素的innerHTML内容.
     * @param {string} val 设置的html标记
     * @returns {jslib} 取值时返回值.否则返回this
     */
    'html': function (val) {
        if (val === undefined) {
            if (!this[0]) return;
            return this[0].innerHTML;
        }
        this.each((dom) => {
            _parseHtml(val, (fragment) => {
                dom.innerHTML = '';
                dom.append(fragment);
            });
        });
        return this;
    },
    /**
     * 向每个匹配元素内部追加内容(原生: append())
     * @param {any[]} val node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    'append': function (val) {
        this.each((dom) => {
            _parseHtml(val, (fragment) => {
                dom.append(fragment);
            });
        });
        return this;
    },
    /**
     * 向每个匹配元素内部第一子节点前面加入内容(原生: prepend())
     * @param {any[]} val node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    'prepend': function (val) {
        this.each((dom) => {
            _parseHtml(val, (fragment) => {
                dom.prepend(fragment);
            });
        });
        return this;
    },
    /**
     * 向每个匹配元素的前面加元素(原生: insertBefore())
     * @param {any[]} val node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    'before': function (val) {
        this.each((dom) => {
            _parseHtml(val, (fragment) => {
                dom.parentNode.insertBefore(fragment, dom);
            });
        });
        return this;
    },
    /**
     * 向每个匹配元素的后面加元素(原生: insertBefore())
     * @param {any[]} val node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    'after': function (val) {
        this.each((dom) => {
            _parseHtml(val, (fragment) => {
                dom.parentNode.insertBefore(fragment, dom.nextSibling);
            });
        });
        return this;
    },
    /**
     * 删除所有匹配的元素(原生: parentNode.removeChild())
     */
    'remove': function () {
        this.each((dom) => {
            dom.parentNode.removeChild(dom);
        });
        this.reset();
    },
    /**
     * 清空所有匹配的元素的全部子元素(原生: innerHTML='')
     * @returns {jslib} 返回this
     */
    'empty': function () {
        this.each((dom) => {
            dom.innerHTML = '';
        });
        return this;
    },
    /**
     * 从url加载html,然后设置到所有匹配元素的innerHTML.不能跨域.
     * 也可以加载js,为了实现动态加载js.
     * 用url扩展名判断,例如 xx.js是js文件,hh.html是html文件
     * @param {string} url
     * @param {Function} callback
     */
    'load': function (url, callback) {
        if (!url) return this;
        // 1. 实例化 XMLHttpRequest
        var xhr = new XMLHttpRequest();
        // 2. 处理请求回调
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let result = xhr.response;
                    // 支持js,如果是js文件,那么放到script中. this.html()会解析执行脚本的
                    if (url.lastIndexOf('.js') == url.length - 3) {
                        result = `<script>${xhr.response}</script>`;
                    }
                    this.html(xhr.response);
                    // 执行加载成功方法
                    if (typeof callback === "function") {
                        callback();
                    }
                } else {
                    throw new Error(xhr.statusText);
                }
            }
        }
        // 3.发送请求
        xhr.open('GET', url);
        xhr.send();
    }
});