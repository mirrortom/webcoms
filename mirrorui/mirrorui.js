//================================================================================//
// 简化JS的DOM操作API做了封装
// 使用方法同jQuery: $('#id').addClass('acitve')
//=================================================================================//
// 
((win) => {
    "use strict";
    /**
     * js自定义封装库的定义函数.(下述都称为jslib类数组对象,简称jslib)
     * @param {string|HTMLElement} selector 选择器或者dom对象或/^<[a-z]+?>$/,如'<div>'.表示新建元素.
     * @returns {jslib} 返回this.如果选择器没有找到元素,jslib对象没有length属性(undefine)
     */
    function jslib(selector) {
        // 选择器
        if (typeof selector === 'string') {
            if (/^<[a-z]+?>$/.test(selector)) {
                // 新建元素
                this.push(document.createElement(selector.substring(1, selector.length - 1)));
            }
            else {
                // 其它选择器
                let nodelist = document.querySelectorAll(selector);
                nodelist.forEach((item) => {
                    this.push(item);
                });
            }
        }
        else if (selector.nodeType) {
            // 是一个dom对象
            this.push(selector);
        }
        else if (selector.length) {
            // 是一个dom对象列表
            for (var i = 0, len = selector.length; i < len; i++) {
                if (selector[i].nodeType) {
                    this.push(selector[i]);
                }
            }
        } else {
            throw new Error("the selector invalid");
        }
        return this;
    }
    /**
     * 向jslib类数组添加元素
     * @param {any} item node节点
     * @returns {jslib} 返回this
     */
    jslib.prototype.push = function (item) {
        Array.prototype.push.call(this, item);
        return this;
    };
    /**
     * 重置jslib类数组内容
     * @param {NodeList} elemlist 用于填充的新DOM元素列表,如果其中元素已经在jslib类数组中,则不会重复添加
     * @returns {jslib} 返回this
     */
    jslib.prototype.reset = function (elemlist) {
        Array.prototype.splice.call(this, 0);
        if (elemlist) {
            elemlist.forEach((item) => {
                this.push(item);
            });
        }
        return this;
    };
    /**
     * 遍历jslib类数组元素.
     * @param {Function} fn fn(item,index),fn返回false时,循环break,返回true时,循环continue
     */
    jslib.prototype.each = function (fn) {
        for (let i = 0, len = this.length; i < len; i++) {
            let re = fn(this[i], i);
            if (re == true)
                continue;
            else if (re == false)
                break;
        }
    };

    ////////////////////////////////////////////////////////////////////////
    // 工厂函数factory,返回jslib对象
    // 其它静态方法都绑定在factory上
    ////////////////////////////////////////////////////////////////////////
    let factory = (selector) => {
        return new jslib(selector);
    };
    /**
     * 为jslib对象添加实例方法 prototype
     * @param {any} json 一个方法名和函数值的json对像.方法名要用""号包起来.
     */
    factory.extend = (json) => {
        for (var name in json) {
            jslib.prototype[name] = json[name];
        }
    };
    /**
     * 建立一个DocumentFragment文档片段对象,将传入的node或DocumentFragment()对象添加到其中.
     * @param {any[]} content node节点 | DOMString对象 | DocumentFragment对象
     * @returns {DocumentFragment} 返回这个DocumentFragment对象
     */
    factory.fragment = (...content) => {
        let fragm = document.createDocumentFragment();
        fragm.append(...content);
        return fragm;
    };

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
     * 最后生成一个包含解析后的html元素的DocumentFragment对象.
     * @param {string|any} val html字符串,DocumentFragment对象或者node对象,nodelist对象
     * @param {any} onReady 解析完成后执行
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
         * 设置所有匹配的元素的innerHTML属性.
         * 无参数时,返回第一个元素的innerHTML内容.
         * @param {any} val node节点 | DOMString对象 | DocumentFragment对象
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
        }
    });
    // window上的引用名
    if (!win.ns)
        win.ns = {};
    win.ns.domHelp = factory;
})(window);
// ====================================================================================
// m-btn 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-btn', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // 样式
            $(this).addClass('btn');
        }
        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
            // ==================
            // init set prop
            // ==================
        }

        // =======
        // method
        // =======
        // 判断btn是否含有loading样式.如果没有会添加上等待样式
        isLoading() {
            let thisobj = $(this);
            if (thisobj.hasClass('loading'))
                return true;
            thisobj.addClass('loading');
            return false;
        }
        // 去掉btn的loading样式.time是豪秒数,表示经过此时间后去掉loading样式
        clsLoading(time) {
            let thisobj = $(this);
            if (time >= 0) {
                setTimeout(() => {
                    thisobj.removeClass('loading');
                }, time);
            } else {
                thisobj.removeClass('loading');
            }
        }
    });
})(window);
// ====================================================================================
// m-switch 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-switch', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======
            // 点击切换
            this.onclick = () => {
                let thisobj = $(this);
                if (this.onoff == true) {
                    this.onoff = false;
                    thisobj.removeClass('checked');
                    thisobj.text(this.offTag);
                } else {
                    this.onoff = true;
                    thisobj.addClass('checked');
                    thisobj.text(this.onTag);
                }
                // 点击切换后执行方法
                if (typeof this._onClick == 'function')
                    this._onClick(this);
            }

            // ==================
            // init set prop
            // ==================
            let thisobj = $(this);
            // 样式
            thisobj.addClass('switch');
            // 开关属性标题可以设置,默认是ON/OFF
            this.onoff = thisobj.hasClass('checked') ? true : false;
            this.onTag = thisobj.prop('on') || 'ON';
            this.offTag = thisobj.prop('off') || 'OFF';
            thisobj.text(this.onoff ? this.onTag : this.offTag);
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
        }

        // =======
        // prop
        // =======
        // checked属性.开返回true,关返回false
        get checked() {
            return this.onoff;
        }
        // 点击切换后执行方法
        set onClicked(fn) {
            this._onClick = fn;
        }
        // =======
        // method
        // =======
    });
})(window);
// ====================================================================================
// m-file 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-file', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======

            // ==================
            // init set prop
            // ==================
            let thisobj = $(this);
            // tag属性设置初始标题
            this.tag = thisobj.prop('tag') || '请选择文件...';
            // 样式
            thisobj.addClass('input-file');
            //
            this.reset();
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
        }

        // =======
        // prop
        // =======
        // 获取input-file的dom对象
        get inputFile() {
            return this.querySelector('input[type=file]');
        }
        // 获取files文件数组
        get files() {
            return this.querySelector('input[type=file]').files;
        }
        // =======
        // method
        // =======
        // 重置控件,已选的文件会清除
        reset() {
            this.innerHTML = '';
            this.innerText = '';
            let thisobj = $(this);

            // 添加input type=file和label标签
            let fileDom = $('<input>').prop('type', 'file')[0];
            if (this.hasAttribute('disabled')) {
                fileDom.disabled = true;
            }
            if (this.hasAttribute('multiple')) {
                fileDom.multiple = true;
            }
            // input-file选择改变时,文件路径显示在label上
            fileDom.onchange = () => {
                let fnlist = '';
                let files = this.inputFile.files;
                [].forEach.call(files, (item) => {
                    fnlist += item.name + ',';
                });
                fnlist = fnlist.substr(0, fnlist.length - 1);
                console.log(fnlist);
                $(this).find('.form-label').text(fnlist);
            }
            // 设置标题
            let labelDom = $('<label>').addClass('form-label').text(this.tag)[0];
            //
            thisobj.append(fileDom);
            thisobj.append(labelDom);
        }
    });
})(window);
// ====================================================================================
// m-check 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-check', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======
            // 点击切换
            this.onclick = () => {
                if (this.hasAttribute('disabled')) return;
                let thisobj = $(this);
                let ischecked = thisobj.hasClass('checked');
                if (ischecked == true) {
                    thisobj.removeClass('checked');
                } else {
                    thisobj.addClass('checked');
                }
                //
                //console.log(this.checked);
            }

            // ==================
            // init set prop
            // ==================
            let thisobj = $(this);
            // 样式
            thisobj.addClass('input-check');
            // 复选框
            thisobj.append($('<span>').addClass('check')[0]);
            // 标题
            let tag = thisobj.prop('tag') || '';
            thisobj.append($('<label>').addClass('form-label').text(tag)[0]);
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
        }

        // =======
        // prop
        // =======
        // checked属性.勾选返回true,未勾选返回false
        get checked() {
            return $(this).hasClass('checked');
        }

        // =======
        // method
        // =======
    });
})(window);
// ====================================================================================
// m-radio 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-radio', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======
            // 点击切换
            this.onclick = () => {
                if (this.hasAttribute('disabled')) return;
                let thisobj = $(this);
                if (thisobj.hasClass('checked')) return;
                thisobj.addClass('checked');
                // 取消同级的(在同一个父元素下的),name属性值相同的单选按钮的选中状态
                thisobj.siblings('m-radio[name=' + thisobj.prop('name') + ']').removeClass('checked');
                // 点击切换后执行方法
                if (typeof this._onClick == 'function')
                    this._onClick(this);
            }

            // ==================
            // init set prop
            // ==================
            let thisobj = $(this);
            // 样式
            thisobj.addClass('input-check');
            // 单选框
            thisobj.append($('<span>').addClass('radio')[0]);
            // 标题
            let tag = thisobj.prop('tag') || '';
            thisobj.append($('<label>').addClass('form-label').text(tag)[0]);
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
        }

        // =======
        // prop
        // =======
        // checked属性.选中true
        get checked() {
            return $(this).hasClass('checked');
        }
        // 点击切换后执行方法
        set onClicked(fn) {
            this._onClick = fn;
        }
        // =======
        // method
        // =======
    });
})(window);
/*
缓存页组件:
    组件的主要能力是使用createDocumentFragment这个API将页面缓存为DOM片段.
    由于片段不在文档流内,所以不会影响当前HTML文档.组件的点击事件状态靠几个关键属性保证.
cache:
    缓存对象,键是每个页面对应的ID,值是DOM片段对象.对于当前显示的DOM,其值为null.
    在选项卡的添加减少切换时,都会将当前显示DOM的值置为null.
tabsDom:
    选项卡工具栏的DOM,包含选项卡栏和其它功能按钮.当前活动的选项卡只能有一个,以样式类active标明.
contDom:
    用于显示DOM的容器
 */
((win) => {
    // 帮助函数
    const $ = win.ns.domHelp;
    // 生成选项卡和功能区DOM,添加到容器内
    /* html内容:
        <a class="tabsbox-left"></a>
        <nav class="tabsbox-navbox">
          <div class="tabsbox-nav"></div>
        </nav>
        <a class="tabsbox-right"></a>
        <div class="tabsbox-menugroup">
          <span class="tabsbox-menutitle">功能</span>
          <div class="tabsbox-menulist">
            <span class="tabsbox-goto-active">定位当前页</span>
            <span class="tabsbox-close-all">关闭全部</span>
            <span class="tabsbox-close-other">关闭其它</span>
          </div>
        </div>
     */
    let createTabDom = (tabsDom) => {
        let fragment = $.fragment();
        fragment.append($('<a>').addClass('tabsbox-left')[0]);
        fragment.append($('<nav>').addClass('tabsbox-navbox').append($('<div>').addClass('tabsbox-nav')[0])[0]);
        fragment.append($('<a>').addClass('tabsbox-right')[0]);
        let menugroup = $('<div>').addClass('tabsbox-menugroup')
            .append($('<span>').addClass('tabsbox-menutitle')[0]);
        let menulist = $('<div>').addClass('tabsbox-menulist')
            .append($('<span>').addClass('tabsbox-goto-active').text('定位当前页')[0])
            .append($('<span>').addClass('tabsbox-close-all').text('关闭全部')[0])
            .append($('<span>').addClass('tabsbox-close-other').text('关闭其它')[0]);
        menugroup.append(menulist[0]);
        fragment.append(menugroup[0]);
        $(tabsDom).append(fragment).addClass('tabsbox');
    };

    // 去掉活动选项卡的活动状态(去掉active样式)
    let clearActivedTab = (tabsDom) => {
        let activeTabDom = $(tabsDom).find('.tabsbox-tab.active');
        if (activeTabDom.length > 0) {
            activeTabDom.removeClass('active');
        }
    }

    // 切换激活指定id的选项卡.然后返回其tab的Dom对象
    let activeTab = (tabsDom, pid) => {
        // 去掉当前活动的选项卡
        clearActivedTab(tabsDom);
        // 添加pid选项卡活动样式
        let tabDom = $(tabsDom).find(".tabsbox-tab[val='" + pid + "']").addClass('active')[0];
        return tabDom;
    };

    // 调整选项卡框的滚动条值,使指定选项卡处于中间位置.
    let adjustPositionTab = (tabsDom, tabDom) => {
        let navDom = $(tabsDom).find('.tabsbox-nav')[0];
        // nav宽度
        let w = navDom.clientWidth;
        // 该选项卡离选项卡框左起位置
        let tabLeft = tabDom.offsetLeft;
        // 让tab位于navdom的中间位置,算法:定位到tab离左边距离,再减去navDom宽度的一半
        navDom.scrollTo(tabLeft - (w / 2), 0);
    };

    // 按钮事件: 点击选项卡x按钮,关闭它
    let closeTab = (cache, tabDom, tabsDom, contDom, events) => {
        $(tabDom).find('.tabsbox-tabclose')[0].onclick = (event) => {
            event.stopPropagation();
            let cacheId = $(tabDom).prop('val');
            // (情形1)关闭的是最后一个tab页,删除tab,清空缓存
            if (Object.getOwnPropertyNames(cache).length == 1) {
                // 删除选项卡,删除缓存,清空显示容器
                $(tabDom).remove();
                $(contDom).empty();
                for (let k in cache) {
                    delete cache[k];
                }
                if (typeof events.pageClosed == 'function')
                    events.pageClosed(cacheId);
                return;
            }
            // (情形2)关闭时,多于1个tab页时
            // 清除对应缓存,
            delete cache[cacheId];
            // 如果关闭的是活动页,将cache中最后一个id,对应的选项卡激活,对应DOM载入显示容器
            // 这种情况下要触发切换选项卡事件
            if ($(tabDom).hasClass('active')) {
                let cacheId = Object.getOwnPropertyNames(cache).pop();
                // 切换前事件发生
                if (typeof events.pageBeforeChange == 'function')
                    events.pageBeforeChange(cacheId);
                let atab = activeTab(tabsDom, cacheId);
                adjustPositionTab(tabsDom, atab)
                $(contDom).html(cache[cacheId]);
                cache[cacheId] = null;
                // 切换后事件发生
                if (typeof events.pageChanged == 'function')
                    events.pageChanged(cacheId);
            }
            // 删除tab,
            $(tabDom).remove();
            if (typeof events.pageClosed == 'function')
                events.pageClosed(cacheId);
        };
    };

    // 按钮事件: 选项卡点击
    let selectedTab = (cache, tabDom, tabsDom, contDom, events) => {
        tabDom.onclick = () => {
            // 点击选项卡时,位置会相应调整,确保点击的选项卡完全显示在父级的可见区域.
            adjustPositionTab(tabsDom, tabDom);

            // (情形1)点击的是活动页面,退出
            if ($(tabDom).hasClass('active'))
                return;

            // (情形2)非活动页面,即切换行为
            let cacheId = $(tabDom).prop('val');
            // 执行切换前方法
            if (typeof events.pageBeforeChange === 'function') {
                events.pageBeforeChange(cacheId);
            }
            // 缓存当前DOM
            cacheActiveTab(cache, contDom);
            // 去掉切换前的活动的选项卡活动状态
            clearActivedTab(tabsDom);
            $(tabDom).addClass('active');
            // 激活点击的选项卡,获取其缓存页加载到显示容器
            $(contDom).html(cache[cacheId]);
            cache[cacheId] = null;
            // 执行切换后方法
            if (typeof events.pageChanged == 'function')
                events.pageChanged(cacheId);
        };
        //console.log(cache);
    };

    // 选项卡条功能事件:
    let tabsBtnEventBind = (cache, tabsDom, contDom, events) => {
        // 向左滚动按钮
        $(tabsDom).find('.tabsbox-left')[0].onclick = () => {
            scrollerTabs('left', tabsDom);
        };
        // 向右滚动按钮
        $(tabsDom).find('.tabsbox-right')[0].onclick = () => {
            scrollerTabs('right', tabsDom);
        };

        // 定位当前按钮
        $(tabsDom).find('.tabsbox-goto-active')[0].onclick = () => {
            let activeTab = $(tabsDom).find('.active')[0];
            if (!activeTab) return;
            adjustPositionTab(tabsDom, activeTab);
        };
        // 关闭全部选项卡
        $(tabsDom).find('.tabsbox-close-all')[0].onclick = () => {
            // 删除选项卡,删除缓存,清空显示容器
            let navDom = $(tabsDom).find('.tabsbox-nav').empty();
            $(contDom).empty();
            for (let k in cache) {
                delete cache[k];
                if (typeof events.pageClosed == 'function')
                    events.pageClosed(k);
            }
        };
        // 关闭除当前外所有选项卡
        $(tabsDom).find('.tabsbox-close-other')[0].onclick = () => {
            // 删除选项卡除活动的外
            let navDom = $(tabsDom).find('.tabsbox-nav .tabsbox-tab:not(.active)').remove();
            // 除了为null的都删除掉,null是当前页特征
            for (let prop in cache) {
                if (cache.hasOwnProperty(prop)) {
                    if (cache[prop] === null)
                        continue;
                    delete cache[prop];
                    if (typeof events.pageClosed == 'function')
                        events.pageClosed(k);
                }
            }
        };
    };

    // 新增选项卡
    let addTab = (cache, pid, title, tabsDom, contDom, events) => {
        // 去掉当前活动的选项卡
        clearActivedTab(tabsDom);
        let tabdom = $('<label>').addClass('tabsbox-tab', 'active').prop({ 'title': title, 'val': pid })
            .html(title).append($('<a>').addClass('tabsbox-tabclose').prop('title', '关闭').text('×')[0])[0];
        // 绑定X关闭事件
        closeTab(cache, tabdom, tabsDom, contDom, events);
        // 绑定点击事件
        selectedTab(cache, tabdom, tabsDom, contDom, events);
        // 添加到选项卡容器
        $(tabsDom).find('.tabsbox-nav').append(tabdom);
    };

    // 获取当前活动页的pid,(cache中null值的键).没找到返回null
    let getActiveTabPid = (cache) => {
        for (let prop in cache) {
            if (cache.hasOwnProperty(prop)) {
                if (cache[prop] === null) {
                    return prop;
                }
            }
        }
        return null;
    }

    // 将活动页内容DOM添加到缓存.(缓存当前页面)
    let cacheActiveTab = (cache, contDom) => {
        // 找到cache中null值的键,将显示容器div中的所有元素添加到DOM片段后,赋值
        let pid = getActiveTabPid(cache);
        if (pid && cache[pid] === null) {
            // 当前页面加入缓存
            cache[pid] = $.fragment(...contDom.childNodes);
            return;
        }
    };

    // 调整选项卡框的滚动条值,使选项卡显示在合适的位置上
    // len:滚动距离,>0 : 向右滚此距离, <0 : 向左滚, 0 : 滚动到最左, 1 : 到最右,
    //              'left': 左滚固定距离, 'right': 右滚固定距离
    let scrollerTabs = (len, tabsDom) => {
        let navDom = $(tabsDom).find('.tabsbox-nav')[0];
        // 滚动条位置
        let sPosition = navDom.scrollLeft;
        // nav宽度
        let w = navDom.clientWidth;
        // nav文档长度
        let swidth = navDom.scrollWidth;
        // 需要滚动的新位置
        let toPosition = 0;
        //
        if (len == 0)
            toPosition = 0;
        else if (len == 1)
            toPosition = swidth;
        else if (len == 'left')
            toPosition = sPosition - (w / 4);
        else if (len == 'right')
            toPosition = sPosition + (w / 4);
        else
            toPosition = sPosition + len;
        // 移动滚动条, 此处无需判是否滚动到头或者尾.如果传入的滚动位置无效,则会自动设为0或最大
        navDom.scrollTo(toPosition, 0);
        // console.log('滚动位置: ' + toPosition);
        // console.log('文档长度: ' + swidth);
    };

    // 缓存当前页面,将要显示的缓存中的页面加载到显示区域
    let cachePageToShow = (cache, pid, tabsDom, contDom) => {
        // 切换活动选项卡状态
        let atabdom = activeTab(tabsDom, pid);
        // 选项卡位置调整到可见区域
        adjustPositionTab(tabsDom, atabdom);
        // 添加当前DOM到缓存
        cacheActiveTab(cache, contDom);
        // 取出pid对应的DOM片段,放入显示容器
        $(contDom).html(cache[pid]);
        // 标识为null,表示pid成为新的活动页
        cache[pid] = null;
    };

    // 加载新的页面
    let newPageToShow = (cache, pid, title, tabsDom, contDom, events) => {
        // 增加选项卡
        addTab(cache, pid, title, tabsDom, contDom, events);
        // 选项卡框滚动条移动到最后
        scrollerTabs(1, tabsDom);
        // 缓存当前活动页面:当增加的是首个选项卡时,没有活动页面,不需要缓存
        if (Object.getOwnPropertyNames(cache).length > 0) {
            cacheActiveTab(cache, contDom);
        }
        // 添加到缓存.当前活动页缓存约定为null,不缓存
        cache[pid] = null;
    };

    // ------------------------------------------------------
    // 初始化cachepage实例(工厂函数)
    // tabsDom:选项卡容器DOM,contDom:显示内容的容器DOM
    // ------------------------------------------------------
    let cachePage = (tabsDom, contDom) => {
        //
        if (!tabsDom || !contDom) throw '必须传入tabsDom,contDom容器对象';
        // ------------
        // Prop
        // ------------
        // 缓存页对象
        let self = {};
        // dom对象
        let _tabsDom = tabsDom;
        let _contDom = contDom;
        // 缓存器,{id1:DocFragment片断,id2:null},值为null的表示当前活动页,只能有一个
        let cache = {};
        // 事件
        let events = {}
        // 自定义数据
        self.data = {}

        // ------------
        // Event
        // ------------
        // 载入新页面后执行 (pid:新页面的id,title:新页面标题,contDom:页面容器)=>{}
        self.onNewPageLoad = (handler) => {
            events.newPageLoad = handler;
        }
        // 页面切换前执行 (pid:切换页面的id)=>{}
        self.onPageBeforeChange = (handler) => {
            events.pageBeforeChange = handler;
        }
        // 页面切换后执行 (pid:切换页面的id)=>{}
        self.onPageChanged = (handler) => {
            events.pageChanged = handler;
        }
        // 页面关闭后执行(pid:关闭页面的id)=>{}
        self.onPageClosed = (handler) => {
            events.pageClosed = handler;
        }

        // 生成选项卡工具dom
        createTabDom(_tabsDom);

        // ------------
        // bind Event
        // ------------
        tabsBtnEventBind(cache, _tabsDom, _contDom, events);

        // ------------
        // Mehtod
        // ------------

        /**
         * 主要方法 载入新页面需要调用的方法,做了更新选项卡状态和DOM缓存状态.
         * 点击左侧菜单时,调用此方法
         * @param {any} pid 菜单唯一标识
         * @param {any} title 选项卡标题
         */
        self.load = (pid, title) => {
            if (!title) {
                title = pid;
            }
            // (情形1) 如果载入的是当前活动的选项卡页,不动作
            if (cache[pid] === null) {
                return;
            }
            // (情形2)激活选项卡.pid已添加过,到缓存中取出页面显示在contDom中,激活对应选项卡.
            if (cache[pid]) {
                if (typeof events.pageBeforeChange === 'function')
                    events.pageBeforeChange(pid);
                cachePageToShow(cache, pid, _tabsDom, _contDom);
                if (typeof events.pageChanged === 'function')
                    events.pageChanged(pid);
                return;
            }
            // (情形3)新增加页面选项卡并且激活.(添加新的pid)
            newPageToShow(cache, pid, title, _tabsDom, _contDom, events);
            // 执行新增事件
            if (typeof events.newPageLoad === 'function')
                events.newPageLoad(pid, title, _contDom);
        };

        // 获取当前活动选项卡的pid.没找到返回null
        self.getActiveTabPid = () => {
            return getActiveTabPid(cache);
        };

        //
        return self;
    };

    //
    win.ns.cachepage = cachePage;
})(window);
// ==============================================
// 模拟系统的弹出框 alert confirm prompt
// 显示在上中下三个位置
// 用于理解弹出框原理
// ==============================================
((win) => {
    // 遮罩样式命
    const shadowCls = 'msgbox-shadow';
    // 弹出层父级样式名
    const modalCls = 'msgbox-modal';
    // 弹出层样式名
    const msgboxCls = 'msgbox';
    // 帮助函数
    const $ = win.ns.domHelp;
    /**
     * 生成遮罩并显示,生成并返回弹出层父级DOM对象
     * @returns {HTMLElement} 弹出层父级DOM对象
     */
    let createMsgBox = () => {
        // 添加遮罩层
        let shadow = $('<div>').addClass(shadowCls)[0];
        document.body.append(shadow);
        // 生成弹出框
        let parentDiv = $('<div>').addClass(modalCls)[0];
        return parentDiv;
    };
    /**
     * 显示弹出层
     * @param {string|HTMLElement} msgboxDom 弹出层html对象或者html字符串
     */
    let showMsgBox = (msgboxDom) => {
        document.body.style.overflow = 'hidden';
        document.body.append(msgboxDom);
    };
    /**
     * 生成标准弹出层的外层div元素,并设置风格样式和位置样式
     * @param {string} msg 要显示的信息
     * @param {string} position 位置:top | bottom
     * @returns {HTMLElement} 返回外层div元素
     */
    let createOuterDiv = (msg, position) => {
        // 样式风格,位置样式
        let outerDiv = $('<div>').addClass(msgboxCls, msgboxCls + '-' + (position || 'center'));
        // 内容
        outerDiv.text(msg || '');
        return outerDiv[0];
    };
    /**
     * 生成标准按钮:确定,取消
     * @param {string} name 按钮种类 ok|cancel
     * * @param {string} theme 按钮风格 primary|success|...
     * @returns {HTMLElement} 返回按钮dom
     */
    let createBtn = (name, theme) => {
        let btn = $('<span>').addClass('btn', msgboxCls + '-' + name, theme).text(name === 'ok' ? '确定' : '取消');
        return btn[0];
    };
    // 弹出框类
    let msgBox = {};
    /**
     * 删除(关闭)遮罩和弹出层
     */
    msgBox.close = () => {
        let body = document.body;
        let modal = body.querySelectorAll('.' + modalCls);
        let shadow = body.querySelectorAll('.' + shadowCls);
        modal.forEach((dom) => {
            dom.parentNode.removeChild(dom);
        });
        shadow.forEach((dom) => {
            dom.parentNode.removeChild(dom);
        });
        // 去掉body滚动条样式
        document.body.style.overflow = null;
    };
    /**
     * alert 弹出框
     * @param {string} msg 要提示的信息
     * @param {Function} onClosed 关闭后执行方法
     * @param {string} style 样式风格:primary | danger | success...
     * @param {string} position 位置:top | bottom
     */
    msgBox.alert = (msg, onClosed, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成遮罩层和弹出层父级,并且加入到body直属
        let parentDiv = createMsgBox();
        // 生成alertDom: 
        // <div class="msgbox 样式? 位置?">内容<span class="btn msgbox-ok">OK</span></div>
        let alertDom = createOuterDiv(msg, position);
        // 按钮
        let okBtn = createBtn('ok', style);
        // 按钮事件
        okBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 执行关闭事件
            if (typeof onClosed === 'function')
                onClosed();
        };
        // 显示
        alertDom.appendChild(okBtn);
        parentDiv.appendChild(alertDom);
        showMsgBox(parentDiv);
    };

    /**
     * confirm 弹出框
     * @param {string} msg 要提示的信息
     * @param {Function} callback 回调函数
     * @param {string} style 样式风格:primary | danger | success...
     * @param {string} position 位置:top | bottom
     */
    msgBox.confirm = (msg, callback, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成遮罩层和弹出层父级,并且加入到body直属
        let parentDiv = createMsgBox();
        // 生成confirmDom:
        // <div class="msgbox 样式? 位置?">内容<span class="msgbox-btn msgbox-ok">OK</span>
        //                    <span class="msgbox-btn msgbox-cancel">Cancel</span></div >
        let confirmDom = createOuterDiv(msg, position);
        // 按钮
        let okBtn = createBtn('ok', style);
        let cancelBtn = createBtn('cancel');
        // 绑定事件
        okBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 结果传回1表示点击OK
            if (typeof callback === 'function')
                callback(1);
        };
        cancelBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 结果传回0表示点击取消
            if (typeof callback === 'function')
                callback(0);
        };
        // 显示
        confirmDom.innerText = msg;
        confirmDom.appendChild(okBtn);
        confirmDom.appendChild(cancelBtn);
        parentDiv.appendChild(confirmDom);
        showMsgBox(parentDiv);
    };

    /**
     * prompt 弹出框
     * @param {string} msg 要提示的信息
     * @param {Function} callback 回调函数
     * @param {string} style 样式风格:primary | danger | success...
     * @param {string} position 位置:top | bottom
     */
    msgBox.prompt = (msg, callback, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成遮罩层和弹出层父级,并且加入到body直属
        let parentDiv = createMsgBox();
        // 生成promptDom:
        // <div class="msgbox 样式? 位置?">内容<input class="msgbox-input" type="text"/>
        // <span class="msgbox-btn msgbox-ok">Ok</span><span class="msgbox-btn msgbox-cancel">Cancel</span></div>
        let promptDom = createOuterDiv(msg, position);
        promptDom.classList.add('msgbox-prompt');
        // input框
        let inputE = $('<input>').addClass('input-text','mg-tb-10').prop('type', 'text')[0];
        // 按钮
        let okBtn = createBtn('ok', style);
        let cancelBtn = createBtn('cancel', style);
        // 绑定事件
        okBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 输入传回
            if (typeof callback === 'function') {
                callback(inputE.value);
            }
        };
        cancelBtn.onclick = () => {
            // 删除弹出框
            msgBox.close();
            // 输入传回空字符串
            if (typeof callback === 'function')
                callback('');
        };
        // 显示
        promptDom.innerText = msg;
        promptDom.appendChild(inputE);
        promptDom.appendChild(okBtn);
        promptDom.appendChild(cancelBtn);
        parentDiv.appendChild(promptDom);
        showMsgBox(parentDiv);
    };

    /**
     * 弹出自定义HTML片段
     * @param {string|HTMLElement} customBox 自定义弹出层html片段
     * @param {Function} onBefore 显示前执行
     * @param {Function} onShow 显示后执行
     */
    msgBox.show = (customBox, onBefore, onShow) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成遮罩层和弹出层父级,并且加入到body直属
        let parentDiv = createMsgBox();
        if (typeof customBox === 'string')
            parentDiv.innerHTML = customBox;
        else
            parentDiv.appendChild(msgboxhtml);
        //
        if (typeof onBefore === 'function')
            onBefore();
        // 显示
        showMsgBox(parentDiv);
        //
        if (typeof onShow === 'function')
            onShow();
    };

    // 引用名称可在此修改
    win.ns.msgbox = msgBox;
})(window);
// =======================================
// 日期组件, 是一个函数.在input上使用此方法.
//  <input onclick="myDatePick()" />
//  时间部分: myDatePick({ fmt: datetime })
// =======================================
((win) => {
    // datebox样式类名
    const dateboxCls = 'date-box';
    // 最大最小年份
    const maxyear = 2100;
    const minyear = 1900;
    // 帮助函数
    const $ = win.ns.domHelp;
    // 时间格式化函数
    let datefmt = (date, fmtstr) => {
        let format = fmtstr || 'yyyy/MM/dd HH:mm:ss';
        let json = {};
        // 替换时,先替换名字较长的属性,以避免如yyyy被分成两次yy替换,造成错误.故长名字属性在前.
        json.yyyy = date.getFullYear();
        json.yy = json.yyyy.toString().substr(2);
        //
        let m = date.getMonth() + 1;
        json.MM = m > 9 ? m : '0' + m;
        json.M = m;
        //
        let d = date.getDate();
        json.dd = d > 9 ? d : '0' + d;
        json.d = d;
        //
        let h = date.getHours();
        json.HH = h > 9 ? h : '0' + h;
        json.H = h;
        //
        let mi = date.getMinutes();
        json.mm = mi > 9 ? mi : '0' + mi;
        json.m = mi;
        //
        let s = date.getSeconds();
        json.ss = s > 9 ? s : '0' + s;
        json.s = s;
        for (let item in json) {
            format = format.replace(item, json[item]);
        }
        return format;
    };

    //------datebox类-----------datebox类---------//

    // 触发日期框的INPUT的DOM对象引用
    let inputDOM = null;
    // 日期框DOM对象
    let dateboxDom = null;
    // 日期框配置对象
    let cfg = null;

    // 在input上使用此方法(主要方法). <input onclick="MyDatePick()" />,需要时间部分: MyDatePick({fmt:datetime})
    let mydate = (config) => {
        let event = window.event || arguments.callee.caller.arguments[0]; // 获取event对象
        event.stopPropagation();
        let input = event.currentTarget;
        // 初始化已选年月日
        initDate(input, config);
        // 生成DOM
        dateboxDom = createDom();
        // 显示
        showDateBox(dateboxDom);
        // 绑定事件
        bindEvent_Show();
    };

    // 初始化:已选年月,保存日期框的INPUT的JQ对象引用
    let initDate = (input, config) => {
        // input的JQ对象
        inputDOM = input;

        // 用inpupt的值初始化时间,为空则默认今天时间.input时间格式只支持 yyyy/MM/dd HH:mm:ss(时间,秒部分可省略)
        let inputval = input.value.trim();
        if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2}$/.test(inputval)) {
            inputval = inputval + ' 00:00:00';
        } else if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}$/.test(inputval)) {
            inputval = inputval + ':00';
        } else if (/^[0-9]{4}\/[0-9]{2}\/[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(inputval)) {
            true;
        } else {
            inputval = null;
        }
        // console.log(inputval);
        // 不带时间部分的日期串,用parse解后,会有时差.
        let inputDate = Date.parse(inputval);
        let date = isNaN(inputDate) ? new Date((new Date()).setHours(0, 0, 0)) : new Date(inputDate);
        //
        //console.log(date);
        cfg = {};
        cfg.year = date.getFullYear();
        cfg.month = date.getMonth();
        cfg.day = date.getDate();
        cfg.hour = date.getHours();
        cfg.minute = date.getMinutes();
        cfg.second = date.getSeconds();
        // 显示格式为日期('yyyy-MM-dd'),或者日期和时间('yyyy-MM-dd HH:mm:ss')
        cfg.dateFmt = 'yyyy/MM/dd';
        cfg.fmtType = 1;
        if (config && config.fmt == 'datetime') {
            cfg.dateFmt = 'yyyy/MM/dd HH:mm:ss';
            cfg.fmtType = 2;
        }
    };
    // 显示日期框
    let showDateBox = (datedom) => {
        //console.log(datedom);
        // 根据input框的位置显示日期DOM框
        let thisleft = inputDOM.offsetLeft + 'px';
        let thistop = inputDOM.offsetTop + inputDOM.offsetHeight + 'px';
        // 576px以下屏(手机屏) 显示在屏幕中央(css媒体查询设为固定定位了)
        let ww = win.innerWidth;
        if (ww < 576) {
            thisleft = 0;
            thistop = '25vh';
        }

        // 清除可能已有的日期框
        $(document.body).find('.' + dateboxCls).remove();

        // 显示新的日期框
        datedom.style.left = thisleft;
        datedom.style.top = thistop;
        document.body.append(datedom);

        // 576以上屏,input框要能手动输入,焦点在input框.在手机上使用选择,不使用手输,焦点在日期控件上.
        if (ww < 576) {
            datedom.focus();
        }
    };
    /*=======================================================*
     * DOM生成
     *=======================================================*/
    // 生成整个日期框的DOM.并返回
    let createDom = () => {
        let ymtarea = $('<div>').addClass('date-area-ymt')
            .append(createDom_Year())
            .append(createDom_Month())
            .append(createDom_Today())[0];

        let weekarea = $('<div>').addClass('date-area-week').append(createDom_Week())[0];

        let dayarea = $('<div>').addClass('date-area-day').append(createDom_Day())[0];

        let datedom = $('<div>').addClass('date-box').prop('tabIndex', -1)
            .append(ymtarea)
            .append(weekarea)
            .append(dayarea);
        // 时间区域,日期+时间格式类型时
        if (cfg.fmtType == 2) {
            let tcarea = $('<div>').addClass('date-area-tc')
                .append(createDom_Time())
                .append(createDom_Clear())
                .append(createDom_Ok())[0];
            datedom.append(tcarea);
        }
        return datedom[0];
    };

    // 1.生成年份区内容 前进,后退,年份 按钮
    let createDom_Year = () => {
        let prevbtn = $('<a>').addClass('date-btn-prev').text('＜')[0];
        let yearbtn = $('<b>').addClass('date-btn-year').prop('val', cfg.year).text(cfg.year + '年')[0];
        let nextbtn = $('<a>').addClass('date-btn-next').text('＞')[0];
        return $('<div>').addClass('date-area-year')
            .append(prevbtn)
            .append(yearbtn)
            .append(nextbtn)[0];
    };

    // 1.1生成年份下拉选择框. selectedYear:可指定一个年份为已选定
    let createDom_YearSelect = (selectedYear) => {
        let ydoms = '';
        let ylistData = domYear_Data();
        if (!selectedYear)
            selectedYear = (new Date()).getFullYear();
        //
        let dom = $('<div>').addClass('date-select-year');
        for (let i = 0; i < ylistData.length; i++) {
            let isselect = ylistData[i] == selectedYear ? "selected" : "";
            let itemtxt = ylistData[i];
            let itemdom = $('<b>').addClass('date-option-year', isselect).prop('val', itemtxt).text(itemtxt)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };

    // 2.生成月份区 前进,后退,月份 按钮
    let createDom_Month = () => {
        let prevbtn = $('<a>').addClass('date-btn-prev').text('＜')[0];
        let monthbtn = $('<b>').addClass('date-btn-month').prop('val', cfg.month).text(cfg.month + 1 + '月')[0];
        let nextbtn = $('<a>').addClass('date-btn-next').text('＞')[0];
        return $('<div>').addClass('date-area-month')
            .append(prevbtn)
            .append(monthbtn)
            .append(nextbtn)[0];
    };

    // 2.1生成月份下拉选择框. selectedMonth:可指定一个月份为已选定
    let createDom_MonthSelect = (selectedMonth) => {
        let dom = $('<div>').addClass('date-select-month');
        for (let i = 0; i < 12; i++) {
            let isselect = selectedMonth == i ? "selected" : "";
            let itemdom = $('<b>').addClass('date-option-month', isselect).prop('val', i).text(i + 1)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };

    // 3.生成星期标题头
    let createDom_Week = () => {
        let weeksdom = $.fragment();
        let weeks = ['日', '一', '二', '三', '四', '五', '六'];
        for (let i = 0; i < weeks.length; i++) {
            let isweekend = (i === 0 || i === 6) ? 'date-item-weekend' : '';
            let itemdom = $('<b>').addClass('date-item-week', isweekend).text(weeks[i])[0];
            weeksdom.append(itemdom);
        }
        return weeksdom;
    };

    // 4.生成天选项 daylist:日数据.不传则使用选定年月计算出日
    let createDom_Day = (daylist) => {
        let data = daylist || domDay_Data();
        let fragment = $.fragment();
        for (var i = 0; i < data.length; i++) {
            let json = data[i];
            json.istoday = json.Istoday ? 'date-item-today' : '';
            json.isselected = json.Isselected ? 'selected' : '';
            json.isdayinmonth = json.Isdayinmonth ? '' : 'date-item-dayoutmonth';
            json.isweekend = json.Isweekend ? 'date-item-weekend' : '';
            //json.exportName = exportName;
            let daydom = $('<b>').addClass('date-item-day', json.istoday, json.isdayinmonth, json.isselected
                , json.isweekend).prop({ 'year': json.yyyy, 'month': json.MM, 'day': json.dd }).text(json.dd)[0];
            fragment.append(daydom);
        }
        return fragment;
    };
    // 5.生成时分秒区域
    let createDom_Time = () => {
        let hour = $('<b>').addClass('date-btn-time', 'date-btn-hour').text(cfg.hour)[0];
        let minute = $('<b>').addClass('date-btn-time', 'date-btn-minute').text(cfg.minute)[0];
        let second = $('<b>').addClass('date-btn-time', 'date-btn-second').text(cfg.second)[0];
        return $('<div>').addClass('date-area-time')
            .append(hour)
            .append(minute)
            .append(second)[0];
    };
    // 5.1生成小时选择框
    let createDom_HourSelect = () => {
        let dom = $('<div>').addClass('date-select-hour');
        let title = ['凌晨', '上午', '下午', '夜晚'];
        for (let i = 0; i < 24; i++) {
            let itemdom = $('<b>').addClass('date-option-hour').prop('val', i).text(i)[0];
            if (i % 6 == 0)
                dom.append($('<span>').addClass('date-option-title').text(title[i / 6])[0]);
            dom.append(itemdom);
        }
        return dom[0];
    };
    // 5.2生成分钟,秒钟选择框
    let createDom_MinuteSelect = () => {
        let dom = $('<div>').addClass('date-select-minute');
        for (let i = 0; i < 60; i++) {
            let itemdom = $('<b>').addClass('date-option-minute').prop('val', i).text(i)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };
    // 5.3生成秒钟选择框
    let createDom_SecondSelect = () => {
        let dom = $('<div>').addClass('date-select-second');
        for (let i = 0; i < 60; i++) {
            let itemdom = $('<b>').addClass('date-option-second').prop('val', i).text(i)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };
    // 6.生成今天按钮区域
    let createDom_Today = () => {
        return $('<div>').addClass('date-area-today').html('<a class="date-btn-today">今天</a>')[0];
    };
    // 7.生成清除按钮区域
    let createDom_Clear = () => {
        return $('<div>').addClass('date-area-clear').html('<a class="date-btn-clear">清空</a>')[0];
    };
    // 8.生成确定按钮区域 
    let createDom_Ok = () => {
        return $('<div>').addClass('date-area-ok').html('<a class="date-btn-ok">确定</a>')[0];
    };

    // 根据选定的年,月刷新日(用于当在日期框上操作年,月等会改变年月的动作时)
    // yyyy:指定年,mm:指定月 daysdom:日的父级DOM的JQ对象(.daysrows)
    let resetDaysDom = (yyyy, mm) => {
        // 计算出指定年月的日数据
        let dayslist = domDay_Data(yyyy, mm);
        // 生成天DOM
        let daysdom = createDom_Day(dayslist);
        // 更新天DOM
        $(dateboxDom).find('.date-area-day').empty().append(daysdom);
        // 事件绑定
        bindEvent_DaySelected();
    };

    /*----------------为DOM提供的数据,年份 日-----------为DOM提供的数据,年份 日-------- */
    // 根据已选年计算年份选项
    let domYear_Data = () => {
        // 年份选择范围固定在[1900-2100]
        let data = [];
        for (let i = minyear; i <= maxyear; i++) {
            data.push(i);
        }
        return data;
    };

    // 根据已选年月或者传入指定年月,计算日的起始和结束
    // 日(天)总共六行七列42个,含已选年月所有日, 前推至最近的周日, 后推至最近或次近的周六
    let domDay_Data = (yyyy, mm) => {
        // 指定年 超范围则设为当天年
        let seledY = isNaN(parseInt(yyyy)) ? cfg.year : parseInt(yyyy);
        // 指定月 超范围设为当天月
        let seledM = isNaN(parseInt(mm)) ? cfg.month : parseInt(mm);

        // 指定年月的起止日(1~xx号)
        let startDay = new Date(seledY, seledM, 1);
        //let endDay = new Date(seledY, seledM + 1, 0);

        // 日期起点为指定年月的1号前推到最近的周日,终点为该月最后一天后推到最近的周六
        startDay.setDate(1 - startDay.getDay());
        //endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
        // 当天日期
        let todaystr = datefmt(new Date(), 'yyyyMMdd');
        let daylist = [];
        for (let i = 0; i < 42; i++) {
            let json = {};
            json.yyyy = startDay.getFullYear();
            json.MM = startDay.getMonth();
            json.dd = startDay.getDate();
            // 日是否属于指定年月中的日
            json.Isdayinmonth = json.MM == seledM;
            // 日是否为今天 
            json.Istoday = datefmt(startDay, 'yyyyMMdd') == todaystr;
            // 日是否选定(等于文本框中已选日)
            json.Isselected =
                (json.yyyy == cfg.year && json.MM == cfg.month &&
                    json.dd == cfg.day);
            // 这天是否为周六日(这里未真正判断,而是根据位置判断,每七天为一行,行首周日行尾周六)
            json.Isweekend = (i % 7 == 0 || (i + 1) % 7 == 0);
            //
            startDay.setDate(json.dd + 1);
            daylist.push(json);
        }
        //console.log(daylist);
        return daylist;
    };

    /*============================================================*
     * 事件方法:年,月的前进后退按钮,年月选择按钮,今天按钮
     *============================================================*/
    // 控件显示后,要绑定控件的基础事件.
    let bindEvent_Show = () => {
        bindEvent_DateBox();
        bindEvent_YearBtn();
        bindEvent_MonthBtn();
        bindEvent_YearMonthPrevNext();
        bindEvent_TodayBtn();

        bindEvent_DaySelected();
        // 小时,分钟,秒,取消,确定,按钮在有时分秒格式时才有
        if (cfg.fmtType == 2) {
            bindEvent_HourBtn();
            bindEvent_MinBtn();
            bindEvent_SecBtn();
            bindEvent_ClearBtn();
            bindEvent_OkBtn();
        }
    };

    let bindEvent_DateBox = () => {
        // 点击日期控件以内区域,阻止冒泡到根
        dateboxDom.onclick = (event) => {
            event.stopPropagation();
            // 点击空白位置时,关闭已经打开的年,月,日,时,分,秒的选择框.需要在子元素上取消冒泡
            $(dateboxDom).find('[class^=date-select]').remove();
        };
    };
    let bindEvent_YearBtn = () => {
        // 点击年按钮 显示年选择框
        $(dateboxDom).find('.date-btn-year')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let seledY = $(thisobj).prop('val');
            // 年份选择框 .date-select-year
            let yearopsbox = $(thisobj.parentElement).find('.date-select-year');
            // 如果已经显示则关闭
            if (yearopsbox.length > 0) {
                yearopsbox.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherDoms = $(dateboxDom).find('[class^=date-select]');
            otherDoms.remove();
            // 生成年份选择框,填充到年份选择框中
            let yearSelectDom = createDom_YearSelect(seledY);
            thisobj.parentElement.append(yearSelectDom);
            // 定位已选年份到滚动框的中间(视口可见范围内)
            let yseled = $(yearSelectDom).find('.selected')[0];

            // 计算这个年份选项离父框的TOP值,然后滚动条滚动这个值-父框高/2
            let scrollval = yseled.offsetTop - yearSelectDom.clientHeight / 2;
            yearSelectDom.scrollTo(0, scrollval);
            // 绑定年份选择点击事件
            bindEvent_YearSelected();
        };
    };
    let bindEvent_MonthBtn = () => {
        // 点击月按钮 显示月选择框
        $(dateboxDom).find('.date-btn-month')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let seledM = $(thisobj).prop('val');
            let monthsops = $(thisobj.parentElement).find('.date-select-month');
            // 如果已经显示则关闭
            if (monthsops.length > 0) {
                monthsops.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherDoms = $(dateboxDom).find('[class^=date-select]');
            otherDoms.remove();
            //
            thisobj.parentElement.append(createDom_MonthSelect(seledM));
            // 绑定月分选项点击事件
            bindEvent_MonthSelected();
        };
    };
    let bindEvent_YearSelected = () => {
        // 点击年份选项 选定一个年份 
        $(dateboxDom).find('.date-option-year').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 
                // 所选年份值
                let y = $(thisobj).prop('val');
                // 更新年份按钮显示值
                $(dateboxDom).find('.date-btn-year').prop('val', y).text(y + '年');
                // 关闭年份选择框
                $(thisobj.parentElement).remove();
                // 刷新 日
                let m = $(dateboxDom).find('.date-btn-month').prop('val');
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_MonthSelected = () => {
        // 点击月份选项 选定一个月份
        $(dateboxDom).find('.date-option-month').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 
                // 所选月份值
                let m = parseInt($(thisobj).prop('val'));
                $(dateboxDom).find('.date-btn-month').prop('val', m).text(m + 1 + '月');
                // 关闭月份选择框
                $(thisobj.parentElement).remove();
                // 刷新 日
                let y = $(dateboxDom).find('.date-btn-year').prop('val');
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_YearMonthPrevNext = () => {
        // 点击年份,月份的前进和后退按钮 btntype:1=年按钮,2=月按钮. dir:1=前进,2=后退
        $(dateboxDom).find('.date-btn-prev,.date-btn-next').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let btntype = thisobj.parentElement.classList.contains('date-area-year') ? 1 : 2;
                let dir = thisobj.classList.contains('date-btn-next') ? 1 : 2;
                //
                let ybtn = $(dateboxDom).find('.date-btn-year');
                let mbtn = $(dateboxDom).find('.date-btn-month');
                let y = parseInt(ybtn.prop('val'));
                let m = parseInt(mbtn.prop('val'));
                // 计算并刷新年或月按钮值 年份前进后退值[1900-2100]
                if (btntype == 1) {
                    y = dir == 1 ? y + 1 : y - 1;
                    if (y < minyear) y = maxyear;
                    else if (y > maxyear) y = minyear;
                } else if (btntype == 2) {
                    m = dir == 1 ? m + 1 : m - 1;
                    if (m < 0) {
                        m = 11;
                        // 年往后退一年,如果为1900年,则不变
                        if (y > minyear)
                            y = y - 1;
                    } else if (m > 11) {
                        m = 0;
                        // 年往前进一年,如果为2100年,则不变
                        if (y < maxyear)
                            y = y + 1;
                    }
                }
                ybtn.prop('val', y).text(y + '年');
                mbtn.prop('val', m).text(m + 1 + '月');
                // 刷新日
                //console.log(y+'----'+m);
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_TodayBtn = () => {
        // 点击今天按钮 设置今天日期到input框
        $(dateboxDom).find('.date-btn-today')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let today = new Date(new Date().toLocaleDateString());
            inputDOM.value = datefmt(today, cfg.dateFmt);
            //
            mydate.close();
        };
    };
    let bindEvent_HourBtn = () => {
        // 点击小时按钮 显示小时选择框
        $(dateboxDom).find('.date-btn-hour')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let hourselecct = $(dateboxDom).find('.date-select-hour');
            // 点击小时按钮时,弹出小时选择框,同时,按钮加上打开样式,以表示当前选择的是小时
            // 添加样式时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = $(thisobj.parentElement).find('.date-btn-time').removeClass('open');
            // 如果已经是打开状态则关闭
            if (hourselecct.length > 0) {
                hourselecct.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherdoms = $(dateboxDom).find('[class^=date-select]');
            otherdoms.remove();
            // 显示小时选择框
            dateboxDom.append(createDom_HourSelect());
            $(thisobj).addClass('open');
            // 绑定小时选项点击事件
            bindEvent_HourSelected();
        };
    };
    let bindEvent_MinBtn = () => {
        // 点击分钟按钮 显示分钟选择框
        $(dateboxDom).find('.date-btn-minute')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let minselecct = $(dateboxDom).find('.date-select-minute');
            // 点击时分秒下拉框按钮时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = $(thisobj.parentElement).find('.date-btn-time').removeClass('open');
            // 如果已经显示则关闭
            if (minselecct.length > 0) {
                minselecct.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherdoms = $(dateboxDom).find('[class^=date-select]');
            otherdoms.remove();
            dateboxDom.append(createDom_MinuteSelect());
            $(thisobj).addClass('open');
            // 绑定分钟选项点击事件
            bindEvent_MinSelected();
        };
    };
    let bindEvent_SecBtn = () => {
        // 点击秒钟按钮 显示秒钟选择框
        $(dateboxDom).find('.date-btn-second')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let secselecct = $(dateboxDom).find('.date-select-second');
            // 点击时分秒下拉框按钮时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = $(thisobj.parentElement).find('.date-btn-time').removeClass('open');
            // 如果已经显示则关闭
            if (secselecct.length > 0) {
                secselecct.remove();
                return;
            }
            // 先关闭其它弹出窗
            $(dateboxDom).find('[class^=date-select]').remove();
            dateboxDom.append(createDom_SecondSelect());
            $(thisobj).addClass('open');
            // 绑定秒钟选项点击事件
            bindEvent_SecSelected();
        };
    };
    let bindEvent_HourSelected = () => {
        // 选择小时 修改小时按钮显示值
        $(dateboxDom).find('.date-option-hour').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let h = $(thisobj).prop('val');
                $(dateboxDom).find('.date-btn-hour').text(h);
                cfg.hour = h;
                //
                $(thisobj.parentElement).remove();
            };
        });
    };
    let bindEvent_MinSelected = () => {
        // 选择分钟 修改按钮显示值
        $(dateboxDom).find('.date-option-minute').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let m = $(thisobj).prop('val');
                $(dateboxDom).find('.date-btn-minute').text(m);
                cfg.minute = m;
                //
                $(thisobj.parentElement).remove();
            };
        });
    };
    let bindEvent_SecSelected = () => {
        // 选择秒钟 修改按钮显示值
        $(dateboxDom).find('.date-option-second').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let s = $(thisobj).prop('val');
                $(dateboxDom).find('.date-btn-second').text(s);
                cfg.second = s;
                //
                $(thisobj.parentElement).remove();
            };
        });
    };
    let bindEvent_DaySelected = () => {
        // 选择天 设置这天日期到Input框
        $(dateboxDom).find('.date-item-day').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let date = new Date($(thisobj).prop('year'), $(thisobj).prop('month'), $(thisobj).prop('day'), cfg.hour, cfg.minute, cfg.second);
                inputDOM.value = datefmt(date, cfg.dateFmt);
                //
                mydate.close();
            };
        });
    };
    let bindEvent_ClearBtn = () => {
        // 点击清空
        $(dateboxDom).find('.date-btn-clear')[0].onclick = (event) => {
            event.stopPropagation();
            // let thisobj = event.currentTarget;
            //
            inputDOM.value = '';
            mydate.close();
        };
    };
    let bindEvent_OkBtn = () => {
        // 点击确定按钮
        $(dateboxDom).find('.date-btn-ok')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            // 找到选中的日 设置到Input框 如果没有选中的日,使用当前设置日期
            let seledDay = $(dateboxDom).find('.date-item-day.selected');
            let dateStr = datefmt(new Date(cfg.year, cfg.month, cfg.day, cfg.hour, cfg.minute, cfg.second), cfg.dateFmt);
            if (seledDay.length > 0) {
                let d = new Date(seledDay.prop('year'), seledDay.prop('month'), seledDay.prop('day'), cfg.hour, cfg.minute, cfg.second);
                dateStr = datefmt(d, cfg.dateFmt);
            }

            inputDOM.value = dateStr;
            //
            mydate.close();
        };
    };

    // 关闭日期框
    mydate.close = () => {
        dateboxDom = null;
        inputDOM = null;
        cfg = null;
        $(document.body).find('.' + dateboxCls).remove();
    };

    // 点击日期控件以外区域,关闭控件. 
    document.onclick = () => {
        mydate.close();
    };
    // 日期函数名
    win.ns.myDatePick = mydate;
})(window);
// ====================================================================================
// m-pagenum 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-pagenum', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            //
            this.cfg = {};
            // =======
            // event
            // =======

            // ==================
            // init set prop
            // ==================
            // 添加样式
            let thisobj = $(this);
            thisobj.addClass('pagenum');
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
        }

        // =======
        // prop
        // =======
        // 配置
        get config() {
            return this.cfg;
        }
        // 总页数
        set config(cfg) {
            // 当前页码(必须)
            this.cfg.PageIndex = cfg.pageIndex || 1;
            // 每页数量[5-50]
            this.cfg.PageSize = (cfg.pageSize > 4 && cfg.pageSize < 51) ? cfg.pageSize : 10;
            // 数据总数(必须)
            this.cfg.TotalData = cfg.totalData || 0;
            // 总页数
            let pagecount = parseInt(this.cfg.TotalData / this.cfg.PageSize);
            let pagecountMod = this.cfg.TotalData % this.cfg.PageSize;
            this.cfg.TotalPage = pagecountMod > 0 ? pagecount + 1 : pagecount;
            // 分页按钮个数[5-10].
            this.cfg.TotalBtn = (cfg.totalBtn > 4 && cfg.totalBtn < 11) ? cfg.totalBtn : 5;

            // 页码改变后执行(pageIndex:改变后的页码)
            this.cfg.OnPageChg = cfg.onPageChg;
            //console.log(this.cfg);
        }

        // =======
        // method
        // =======
        // 计算起始页(这个方法在内部使用)
        pagenumRange() {
            let cfg = this.cfg;
            let startIndex = cfg.PageIndex - parseInt(cfg.TotalBtn / 2) +
                (cfg.TotalBtn % 2 == 0 ? 1 : 0);
            let endIndex = cfg.PageIndex + parseInt(cfg.TotalBtn / 2);

            // 起始页小于1,说明当前页码位于正中时,前面页码数不够了.应将第1页为起始页码,而结束页码也应该重新计算
            if (startIndex < 1) {
                startIndex = 1;
                // 根据要显示的页码数计算结束页码,如果算出页码数大于总页码,则以总页码数为结束页码
                endIndex = endIndex > cfg.TotalPage ? cfg.TotalPage : cfg.TotalBtn;
            }
            // 结束页码大于总页码,说明当前页码位于正中时,后面的页码数不够.应将总页码数为终止页码,起始页码应重新计算
            if (endIndex > cfg.TotalPage) {
                endIndex = cfg.TotalPage;
                // 根据要显示的页码数计算起始页码,如果算出小于1,则以1为起始页码
                startIndex = endIndex - cfg.TotalBtn + 1;
                if (startIndex < 1)
                    startIndex = 1;
            }
            this.cfg.StartIndex = startIndex;
            this.cfg.EndIndex = endIndex;
            //console.log(this.cfg);
        };

        // 主要方法: 生成分页条
        create(config) {
            // 1.配置设置
            if (config)
                this.config = config;
            let cfg = this.cfg;
            // 1.2 计算页码起止
            this.pagenumRange();

            // 2. dom生成
            this.innerHTML = '';
            this.innerText = '';
            // 2.1 页码按钮区域
            let btnsarea = $('<span>').addClass('btn-group', 'pagenum-btns')[0];

            // 2.1.1 向前按钮
            btnsarea.append($('<a>').addClass('btn', 'pagenum-num').prop('pagenum', cfg.PageIndex - 1).text('〈')[0]);
            // 2.1.2 第1页按钮,当起始页码大于1时添加
            if (cfg.StartIndex > 1) {
                let isactiveNum = cfg.PageIndex == 1 ? 'active' : 'num';
                btnsarea.append($('<a>').addClass('btn', 'pagenum-' + isactiveNum).prop('pagenum', 1).text('1')[0]);
            }
            // 2.1.3 前省略号,当起始页码大于2时添加
            if (cfg.StartIndex > 2) {
                btnsarea.append($('<span>').addClass('btn').text('...')[0]);
            }
            // 2.1.4 页码按钮
            for (let i = cfg.StartIndex; i <= cfg.EndIndex; i++) {
                let pagenum = i;
                let isactiveNum = pagenum == cfg.PageIndex ? 'active' : 'num';
                btnsarea.append($('<a>').addClass('btn', 'pagenum-' + isactiveNum).prop('pagenum', pagenum).text(pagenum)[0]);
            }
            // 2.1.4 后省略号,当结束页小于最大页码-1时
            if (cfg.EndIndex < (cfg.TotalPage - 1)) {
                btnsarea.append($('<span>').addClass('btn').text('...')[0]);
            }
            // 2.1.5 最后页按钮,当结束页小于最大页码时添加
            if (cfg.EndIndex < cfg.TotalPage) {
                let isactiveNum = cfg.PageIndex == cfg.TotalPage ? 'active' : 'num';
                btnsarea.append($('<a>').addClass('btn', 'pagenum-' + isactiveNum).prop('pagenum', cfg.TotalPage).text(cfg.TotalPage)[0]);
            }
            // 2.1.6 向后按钮
            btnsarea.append($('<a>').addClass('btn', 'pagenum-num').prop('pagenum', cfg.PageIndex + 1).text('〉')[0]);

            // 2.2 跳转按钮区域
            let btnskip = $('<span>').addClass('pagenum-skip')[0];
            btnskip.innerHTML = `共<b class="pagenum-total">${cfg.TotalPage}</b>页&emsp;跳转<input class="input-text pagenum-input" />页&emsp;<a class="btn pagenum-ok">确定</a>`;

            // 2.3 添加dom到容器
            this.appendChild(btnsarea);
            this.appendChild(btnskip);

            // 3. 绑定事件
            // 3.1 页码按钮点击
            $(this).find('.pagenum-num').each((item) => {
                item.onclick = () => {
                    // 当前页码参数范围[1-总页码],范围外不动作
                    let pgindex = parseInt($(item).prop('pagenum')) || 0;
                    if (pgindex < 1 || pgindex > cfg.TotalPage) return;
                    // 改变当前页面后,重新生成分页条
                    cfg.PageIndex = pgindex;
                    this.create();
                    //
                    if (typeof this.cfg.OnPageChg == 'function')
                        this.cfg.OnPageChg(pgindex);
                };
            });

            // 3.2 跳转确定按钮点击
            $(this).find('.pagenum-ok')[0].onclick = () => {
                let pgindex = parseInt($(this).find('.pagenum-input')[0].value) || 0;
                if (pgindex < 1 || pgindex > cfg.TotalPage) return;
                // 改变当前页面后,重新生成分页条
                cfg.PageIndex = pgindex;
                this.create();
                //
                if (typeof this.cfg.OnPageChg == 'function')
                    this.cfg.OnPageChg(pgindex);
            };
        }
    });
})(window);
// ====================================================================================
// m-sidemenu 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-sidemenu', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======
            // ==================
            // init set prop
            // ==================
            // 添加样式
            let thisobj = $(this);
            thisobj.addClass('sidemenu');
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {

        }

        // =======
        // prop
        // =======


        // =======
        // method
        // =======

        // 主要方法: 生成侧边菜单
        // json结构: 一个数组,元素是一个对象,每个对象是一组菜单.props是菜单dom属性键值对.styles是样式数组
        // [
        //    {
        //        title: '组标题',
        //        props: { k: 'v', k1: 'v1' },
        //        styles: ['class1', 'class2'],
        //        menus: [
        //            {
        //              title: '菜单标题', props: { k1: v1,k2:v2 }, styles:[class1, class2]
        //            },
        //            { title: '-' 加一条分割线 }
        //        ]
        //    },
        //    ...
        // ]
        // menuItemClickE(item,index): 菜单点击事件.item: 菜单dom对象,index:菜单索引
        //
        create(json, menuItemClickE) {
            // 菜单项dom生成
            if (json) {
                this.innerHTML = '';
                this.innerText = '';
                for (let i = 0, len = json.length; i < len; i++) {
                    let groupItem = json[i];
                    // 菜单组
                    let mgroup = $('<ul>').addClass('sidemenu-group');
                    let menugroupTitle = $('<span>').addClass('sidemenu-label').html(groupItem.title);
                    menugroupTitle.append($('<i>').addClass('sidemenu-arrdown')[0]);
                    //menugroupTitle.prop('title', groupItem.title);
                    groupItem.styles && menugroupTitle.addClass(...groupItem.styles);
                    groupItem.props && menugroupTitle.prop(groupItem.props);
                    mgroup.append($('<li>').append(menugroupTitle[0])[0]);
                    // 菜单项
                    for (let j = 0, len = groupItem.menus.length; j < len; j++) {
                        let menuItem = groupItem.menus[j];
                        // 分割线
                        if (menuItem.title == '-') {
                            mgroup.append($('<li>').html('<b class="sidemenu-split"></b>')[0]);
                            continue;
                        }
                        // 属性和样式
                        let menu = $('<a>').addClass('sidemenu-item').text(menuItem.title);
                        //menu.prop('title', menuItem.title);
                        menuItem.styles && menu.addClass(...menuItem.styles);
                        menuItem.props && menu.prop(menuItem.props);
                        mgroup.append($('<li>').append(menu[0])[0]);
                    }
                    //
                    this.append(mgroup[0]);
                }
            }

            // 事件绑定
            // 1. 菜单组收起和展开
            $(this).find('.sidemenu-label').each((item) => {
                item.onclick = () => {
                    let showClsN = 'sidemenu-arrdown', hideClsN = 'sidemenu-arrleft';
                    let arrowDom = $(item).find(`.${showClsN},.${hideClsN}`);
                    if (arrowDom.hasClass(showClsN)) {
                        arrowDom.removeClass(showClsN);
                        arrowDom.addClass(hideClsN);
                        // 找到ul,添加收起样式
                        $(item).parent('.sidemenu-group').addClass('sidemenu-group-close')
                    } else {
                        arrowDom.addClass(showClsN);
                        arrowDom.removeClass(hideClsN);
                        $(item).parent('.sidemenu-group').removeClass('sidemenu-group-close')
                    }
                }
            })
            // 2. 菜单项点击
            $(this).find('.sidemenu-item').each((item, index) => {
                item.onclick = () => {
                    // 添加活动状态样式
                    $(this).find('.sidemenu-item.active').removeClass('active');
                    $(item).addClass('active');
                    // 执行点击事件
                    let menuIndex = index;
                    if (typeof menuItemClickE == 'function')
                        menuItemClickE(item, menuIndex);
                }
            })
        }

        // 程序点击一个菜单项
        // menuIndex: 菜单索引
        activeItem(menuIndex) {
            let activeMenuItem = $(this).find('.sidemenu-item')[menuIndex];
            activeMenuItem.click();
        }
    });
})(window);
// ====================================================================================
// m-docmenu 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-docmenu', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======
            // ==================
            // init set prop
            // ==================
            // 添加样式
            let thisobj = $(this);
            thisobj.addClass('docmenu');
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {

        }

        // =======
        // prop
        // =======


        // =======
        // method
        // =======

        // 主要方法: 生成文档菜单
        // json结构: 一个数组,元素是一个对象.{title:'菜单组标题',menus:['菜单项1','菜单项2',..,{}]}
        // menus里可以嵌套子菜单组
        // [
        //    {
        //        title: '组标题',
        //        menus: ['菜单项1','菜单项2',
        //                 {
        //                  title: '子菜单组标题',menus:[]]
        //                 }
        //               ]
        //    },
        //    ...
        // ]
        //
        create(json, menuItemClickE) {
            // 菜单项dom生成
            if (json) {

                // 按每个菜单组生成dom,组是一个对象.对象的menus属性是菜单项数组,可能还包含菜单组
                // 所以需要递归,但第一级菜单组都是平级的,不存在一个根菜单.
                let createDocMenuGroup = (group, domBox) => {
                    // 菜单组标题
                    let ul = $('<ul>').addClass('docmenu-group', 'docmenu-group-close');
                    let span = $('<span>').addClass('docmenu-title').html('<i class="docmenu-close"></i>' + group.title);
                    ul.append($('<li>').append(span[0])[0]);

                    // 菜单项标题
                    for (let i = 0; i < group.menus.length; i++) {
                        let menuItem = group.menus[i];
                        // 子级
                        if (typeof menuItem === 'object') {
                            let li = $('<li>')[0];
                            createDocMenuGroup(menuItem, li);
                            ul.append(li);
                        } else {
                            // 属性和样式
                            let menu = $('<a>').addClass('docmenu-item').text(menuItem);
                            ul.append($('<li>').append(menu[0])[0]);
                        }
                    }
                    domBox.append(ul[0]);
                }

                // 循环json,生成菜单
                let tmpDom = $.fragment();
                for (var i = 0; i < json.length; i++) {
                    createDocMenuGroup(json[i], tmpDom);
                }
                this.append(tmpDom);
            }

            // 事件绑定
            // 1. 菜单组收起和展开
            $(this).find('.docmenu-title').each((item) => {
                item.onclick = () => {
                    let openClsN = 'docmenu-open', closeClsN = 'docmenu-close';
                    let iconDom = $(item).find(`.${openClsN},.${closeClsN}`);
                    if (iconDom.hasClass(openClsN)) {
                        iconDom.removeClass(openClsN);
                        iconDom.addClass(closeClsN);
                        // 找到ul,添加收起样式
                        $(item).parent('.docmenu-group').addClass('docmenu-group-close')
                    } else {
                        iconDom.addClass(openClsN);
                        iconDom.removeClass(closeClsN);
                        $(item).parent('.docmenu-group').removeClass('docmenu-group-close')
                    }
                }
            })
            // 2. 菜单项点击
            $(this).find('.docmenu-item').each((item, index) => {
                item.onclick = () => {
                    // 添加活动状态样式
                    $(this).find('.docmenu-item.active').removeClass('active');
                    $(item).addClass('active');
                    // 执行点击事件
                    let menuIndex = index;
                    if (typeof menuItemClickE == 'function')
                        menuItemClickE(item, menuIndex);
                }
            })
        }

        // 程序点击一个菜单项
        // menuIndex: 菜单索引
        activeItem(menuIndex) {
            let activeMenuItem = $(this).find('.docmenu-item')[menuIndex];
            activeMenuItem.click();
        }
        // 打开/关闭所有菜单组
        // tag=-1 关闭
        openGroups(tag) {
            let openClsN = 'docmenu-open', closeClsN = 'docmenu-close',
                groupCloseClsN = 'docmenu-group-close';
            if (tag == -1) {
                $(this).find('.docmenu-group').addClass(groupCloseClsN);
                $(this).find(`.${openClsN}`).removeClass(openClsN).addClass(closeClsN);
                return;
            }
            $(this).find('.docmenu-group').removeClass(groupCloseClsN);
            $(this).find(`.${closeClsN}`).removeClass(closeClsN).addClass(openClsN);
        }
    });
})(window);
// 标签卡自定义组件
((win) => {
    // 帮助函数
    const $ = win.ns.domHelp;
    win.customElements.define('m-tabs', class extends HTMLElement {
        // =======
        // fields
        // =======
        // 容器高度 (px)
        height = 320;
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();

            // ==================
            // init set prop
            // ==================
            this._init();
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
            // 自定义标记放入documentFragment后再取出.也会触发connectedCallback()方法
            // 所以,此方法里最好不用
            // 宜: 元素初始化后不再改变的量,可以读取使用.每次加入dom时,都要呈现新状态,丢弃旧状态的.
            // 不可: 添加子元素,修改变量,其它会导致元素状态改变的行为.

        }


        // =======
        // prop
        // =======


        // =======
        // method
        // =======

        // 初始化
        _init() {
            let thisobj = $(this);
            // height属性设置到容器
            this.style.height = thisobj.prop('height') || this.height + 'px';
            // 样式
            thisobj.addClass('tabs');
            // 标签和面板设置

            // --事件绑定--
            // 标签点击事件
            this._tabOnClick();
        }

        // 点击标签
        _tabOnClick() {
            $(this).find('.tabs-label').each((item) => {
                item.onclick = () => {
                    let actCls = 'active';
                    if ($(item).hasClass(actCls)) {
                        return;
                    }
                    // 去掉当前活动的标签和面板
                    $(this).find('.active').removeClass(actCls);
                    $(item).addClass(actCls);
                    // 根据pid找对应面板,否则根据索引
                    let pid = $(item).prop('pid');
                    if (pid == null || pid.length == 0) {
                        let index = $(item).index();
                        $(this).find('.tabs-panel').eq(index).addClass(actCls);
                        return;
                    }
                    $(this).find('.tabs-panel[pid="' + pid + '"]').addClass(actCls);
                }
            });
        }

        // 激活标签 index:标签索引.index无效则不动作
        activeTab(index) {
            if (index == undefined || isNaN(parseInt(index)))
                return;
            let tabobj = $(this).find('.tabs-label').eq(index)[0];
            if (tabobj) {
                tabobj.click();
            }
        }
    });
})(window);
// ====================================================================================
// m-msgshow 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-msgshow', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======

            // ==================
            // init set prop
            // ==================
            let thisobj = $(this);
            // 添加样式
            $(this).addClass('msgshow');
            
            // title,msg属性
            let title = thisobj.prop('title') || '';
            let msg = thisobj.prop('msg') || '';

            // 如果设置了才生成里面的内容
            if (title) {
                let titleDom = $('<span>').addClass('title').text(title);
                thisobj.append(titleDom[0]);
            }
            if (msg) {
                let msgDom = $('<span>').addClass('msg').text(msg);
                thisobj.append(msgDom[0]);
            }
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
        }

        // =======
        // prop
        // =======
       
        // =======
        // method
        // =======
        /**
         * 在页面上提示自定义信息.
         * @param {string} msg 信息内容
         * @param {string} title 标题
         * @param {string} style 主题类
         */
        show(msg, title, ...style) {
            let thisobj = $(this);
            let tpl = `<span class="title">${title}</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow');
            style && thisobj.addClass(...style);
            //
            thisobj.html(tpl).find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 显示 "成功" 风格提示框
         * @param {any} msg
         */
        ok(msg) {
            let thisobj = $(this);
            let tpl = `<span class="title">\u2714 成功</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow', 'success');
            //
            thisobj.find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 显示 一般信息 风格提示框
         * @param {any} msg
         */
        info(msg) {
            let thisobj = $(this);
            let tpl = `<span class="title">i 提示</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow', 'info');
            //
            thisobj.find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 显示 错误信息 风格提示框
         * @param {any} msg
         */
        err(msg) {
            let thisobj = $(this);
            let tpl = `<span class="title">\u2716 错误</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow', 'danger');
            //
            thisobj.find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 显示 警示 风格提示框
         * @param {any} msg
         */
        warn(msg) {
            let thisobj = $(this);
            let tpl = `<span class="title">\u26A0 警示</span><span class="msg">${msg}</span><b class="close">x</b>`;
            thisobj.html(tpl);
            thisobj.removeClass().addClass('msgshow', 'warning');
            //
            thisobj.find('.close')[0].onclick = () => {
                this.clear();
            }
        }

        /**
         * 清空提示框内容,并且隐藏
         * */
        clear() {
            this.innerHTML = '';
            this.innerText = '';
            $(this).addClass('d-none');
        }
    });
})(window);
// ====================================================================================
// m-mnavmenu 自定义标记 
// 底部导航菜单, 用于手机
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-mnavmenu', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======

            // ==================
            // init set prop
            // ==================
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
            // 添加样式(在构造里添加会报错,违法构造函数里的适用代码规则,但是其它如btn组件就不报错)
            if (!$(this).hasClass('mnavmenu')) {
                $(this).addClass('mnavmenu')
            }
        }

        // =======
        // prop
        // =======

        // =======
        // method
        // =======
        create(menuItemClickE) {
            // 事件绑定
            // 1. 菜单组收起和展开
            $(this).find('.mnavmenu-label').each((item, i) => {
                item.onclick = () => {
                    let itemBoxCls = '.mnavmenu-itembox';
                    let menuItemIsClose = $(item).prev(itemBoxCls).hasClass('close');
                    $(this).find(itemBoxCls).addClass('close');
                    if (menuItemIsClose == true) {
                        $(item).prev(itemBoxCls).removeClass('close');
                    }
                }
            })
            // 2. 子菜单项点击
            $(this).find('.mnavmenu-item,.mnavmenu-menu').each((item, index) => {
                item.onclick = () => {
                    $(item).parent('.mnavmenu').find('.mnavmenu-itembox').addClass('close');
                    if (typeof menuItemClickE == 'function')
                        menuItemClickE(item, index);
                }
            });

        }

        // 程序点击一个菜单项
        // menuIndex: 菜单索引
        activeItem(menuIndex) {
            let activeMenuItem = $(this).find('.mnavmenu-item,.mnavmenu-menu')[menuIndex];
            activeMenuItem.click();
        }
    });
})(window);
((win) => {
    // 帮助函数
    const $ = win.ns.domHelp;
    // 生成选项卡和功能区DOM,添加到容器内
    /* html内容:
        <a class="back"></a>
        <span class="title text-overflow"></span>
        <a class=""></a>
     */
    let createBarDom = (barDom) => {
        let fragment = $.fragment();
        fragment.append($('<a>').addClass('back')[0]);
        fragment.append($('<span>').addClass('title', 'text-overflow')[0]);
        fragment.append($('<a>')[0]);
        $(barDom).append(fragment).addClass('mdirbar');
    };

    // 初始化mdirbar实例(构造)
    // barDom:导航容器DOM
    let mDirBar = (barDom, contDom) => {
        if (!barDom) throw '必须传入barDom,contDom容器对象';
        let self = {};
        self.barDom = barDom;
        self.contDom = contDom;
        // 缓存数组容器 {pid,title,documentFragment}
        self.cache = [];
        // 生成dom
        createBarDom(self.barDom);
        //====================================================================================
        // 主要方法 载入新页面.做了更新缓存状态,新载入的页面始终在缓存设置最后.在菜单的点击事件上要执行此方法.
        // 该方法第3个参数onload(loadType)是一个方法,可以根据loadType参数值判断是否要载入新的页面
        // loadType=1: 菜单是当前页面
        // loadType=2: 菜单之前载入过
        // loadType=3: 是新载入菜单,其对应的页面没有载入过,需要做载入新页面的操作
        //====================================================================================
        // {pid:菜单唯一标识,title:选项卡标题},点击左侧菜单时,调用此方法
        self.load = (pid, title, onload) => {
            //console.log(`pid:${pid},title:${title}`);
            // 1.载入的页面是当前页面,不动作
            if (isCurrPage(pid) == true) {
                if (typeof onload === 'function')
                    onload(1);
                //printlog(1);
                return;
            }
            // 2.载入是的已缓存过的页面
            let pidIndex = pidCacheIndex(pid);
            if (pidIndex > -1) {
                // 添加当前DOM到缓存
                cacheActivePage();
                // 取出pid对应的DOM片段,放入显示容器
                let pidItem = self.cache[pidIndex];
                $(contDom).html(pidItem.dom);
                barTitle(pidItem.title);
                // 移动到缓存最后,设置dom为null.(当前页面始终在缓存最后面)
                self.cache.splice(pidIndex, 1);
                pidItem.dom = null;
                self.cache.push(pidItem);
                //
                if (typeof onload === 'function')
                    onload(2);
                //printlog(2);
                return;
            }
            // 3.新页面
            // 当增加的是第1个选项卡时,没有活动页面,不需要缓存
            if (self.cache.length > 0) {
                cacheActivePage();
            }
            // 加到缓存最后
            self.cache.push({ pid: pid, title: title, dom: null });
            barTitle(title);
            if (typeof onload === 'function')
                onload(3);
            //printlog(3);
        }

        // 指定的pid是否为当前页面
        let isCurrPage = (pid) => {
            let index = pidCacheIndex(pid);
            if (index == -1) return false;
            // dom属性为null表示当前页面
            return self.cache[index].dom == null;
        }

        // 缓存当前页面
        let cacheActivePage = () => {
            // 找到cache中null值的键,将显示容器div中的所有元素添加DOM片段后,赋值
            for (var i = 0, len = self.cache.length; i < len; i++) {
                if (self.cache[i].dom == null) {
                    self.cache[i].title = barTitle();
                    self.cache[i].dom = $.fragment(...self.contDom.childNodes)
                    return;
                }
            }
        }

        // 返回指定pid在缓存数组中的索引,不存在返回-1;
        let pidCacheIndex = (pid) => {
            for (var i = 0, len = self.cache.length; i < len; i++) {
                if (self.cache[i].pid == pid)
                    return i;
            }
            return -1;
        }

        // 设置获取标题
        let barTitle = (title) => {
            if (!title)
                return $(barDom).find('.title').text();
            $(barDom).find('.title').text(title);
        }

        //==========
        // back 回退
        //==========
        self.back = (onback) => {
            // 回退目标页面是cache的倒数第2个项
            let targetIndex = self.cache.length - 2;
            // 回退到最后一个页面,返回-1
            if (targetIndex < 0) {
                //msgbox.alert('已经不能退了!');
                if (typeof onback === 'function')
                    onback(-1);
                return;
            }
            // 删除cahce最后一个项
            self.cache.pop();
            // 取出缓存
            let pageitem = self.cache[targetIndex];
            // 载入缓存页面,设置标题
            $(self.contDom).html(pageitem.dom);
            barTitle(pageitem.title)
            // 设置为当前页面
            pageitem.dom = null;
            //
            if (typeof onback === 'function')
                onback(0);
            //printlog();
        }
        $(barDom).find('.back')[0].onclick = self.back;

        //let printlog = (type) => {
        //  if (type)
        //    console.log('type: ' + type);
        //  console.log('cache:');
        //  console.log(self.cache);
        //  console.log('--- --- --- ---');
        //}
        return self;
    }
    //
    win.ns.mdirbar = mDirBar;
})(window);
// ====================================================================================
// m-range 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-range', class extends HTMLElement {
        // =======
        // fields
        // =======
        // NUglify在压缩js时,js类的成员变量无法识别,暂时不用.

        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();

            // 成员变量
            // 范围边界小值
            this._min;
            // 范围边界大值
            this._max;
            // 滑块当前值
            this._val = 0;
            // 滑条长度
            this._barLen = 0;
            // 鼠标拖动前的起始位置
            this._mStart = { x: 0, y: 0 };
            // 滑块滑动前的起始位置
            this._btnBegin = { x: 0, y: 0 };
            // 滑块dom
            this._rBtn;
            // 滑块文字dom
            this._rTxt;
            // 滑块滑动事件
            this._changeFun;
            // ==================
            // init set prop
            // ==================
            this._init();
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
            // 滑条长度, 在constructor()里,offsetwidth属性值为0,无法使用
            // 自定义标记放入documentFragment后再取出.也会触发connectedCallback()方法
            // 所以,此方法里最好不用
            // 宜: 元素初始化后不再改变的量,可以读取使用.每次加入dom时,都要呈现新状态,丢弃旧状态的.
            // 不可: 添加子元素,修改变量,其它会导致元素状态改变的行为.
            this._barLen = this.offsetWidth - this._rBtn.offsetWidth;
        }


        // =======
        // prop
        // =======
        // 获取/设置滑块当前值
        get Value() {
            return this._val;
        }
        set Value(val) {
            // 设置的值必须在max和min之间(含)
            let v = parseInt(val) || 0;
            if (v < this._min)
                v = this._min;
            else if (v > this._max)
                v = this._max;
            // 调整滑块位置
            let marginLeft = v / this._max * this._barLen;
            this._rBtn.style.marginLeft = marginLeft + 'px';
            this._rTxt.style.marginLeft = marginLeft + 'px';
            // 赋值,显示值
            this._val = v;
            this._rTxt.innerText = v;
        }
        // 滑动事件,fun(val),val:当前滑块值
        set onChange(fun) {
            if (typeof fun === 'function')
                this._changeFun = fun;
        }

        // =======
        // method
        // =======
        // 生成
        _init() {
            // 样式
            $(this).addClass('range-box');
            let width = parseInt(this.getAttribute('width'));
            if (width)
                this.style.width = width + 'px';

            // 子元素
            let innerHtml = '<span class="range-txt"></span><div class="range-bar"><span class="range-btn"></span></div>';
            this.innerHTML = innerHtml;
            // 属性设置
            this._rBtn = this.querySelector('.range-btn');
            this._rTxt = this.querySelector('.range-txt');
            this._min = parseInt(this.getAttribute('min')) || 0;
            this._max = parseInt(this.getAttribute('max')) || 100;
            if (this._min > this._max) {
                this._min = 0;
                this._max = 100;
            }
        
            // 滑块设置值
            this.Value = parseInt(this.getAttribute('val'));
            // 事件绑定
            this._bindEvent();
        }

        // 事件注册
        // 事件绑定在容器元素上,没用绑定在滑块按钮上,为了实现当鼠标不在按钮上时,也能触发滑动事件.
        _bindEvent() {
            // PC端鼠标事件
            this.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this._start(e.x);
            });
            this.addEventListener('mousemove', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (e.buttons == 1) {
                    this._move(e.x);
                }
            });
            this.addEventListener('mouseup', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this._end();
            });
            // 手机端触摸事件
            this.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                e.preventDefault();
                let touch = e.targetTouches[0];
                this._start(touch.pageX);
            });
            this.addEventListener('touchmove', (e) => {
                e.stopPropagation();
                e.preventDefault();
                let touch = e.targetTouches[0];
                this._move(touch.pageX);
            });
            this.addEventListener('touchend', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this._end();
            });
        }

        // --事件方法--
        // 开始拖动
        _start(x) {
            this._mStart.x = x;
            this._btnBegin.x = parseInt(this._rBtn.style.marginLeft.replace('px', '')) || 0;
            $(this._rBtn).addClass('active');
        }
        // 拖动中
        _move(x) {
            let barLen = this._barLen;
            let dX = x - this._mStart.x;
            let targetDist = this._btnBegin.x + dX;
            if (targetDist < 0)
                targetDist = 0;
            else if (targetDist > barLen)
                targetDist = barLen;
            this._rBtn.style.marginLeft = targetDist + 'px';
            this._rTxt.style.marginLeft = targetDist + 'px';
            this._val = parseInt(targetDist / barLen * this._max);
            this._rTxt.innerText = this._val;
            // 执行滑动事件
            if (this._changeFun)
                this._changeFun(this._val);
        }
        // 结束拖动
        _end() {
            $(this._rBtn).removeClass('active');
        }
    });
})(window);
// ====================================================================================
// m-inputwatch 自定义标记
// 扩展原生标记时,例如 HTMLInputElement,define需要有第三个参数 { extends: 'input' }
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-inputwatch', class extends HTMLInputElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======

        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
            // ==================
            // init set prop
            // ==================

        }

        // =======
        // prop
        // =======

        // =======
        // method
        // =======
        // 初始化,fn: 监听改变时执行的方法
        init(fn, time) {
            // 监听改变时,执行的方法
            this.changeE = fn;
            // 监听时间间隔
            this.timeout = time || 1000;
            // 监听状态值 1=监听中 0=停止监听
            this.stopListen = 0;
            // 中文输入状态值 1=输入中 0=输入结束
            this.zhTyping = 0;

            // ==event function==
            // 1.input获得焦点时开始监听
            let watchStartE = () => {
                this.stopListen = 1;
                this.lastValue = this.value;
                this.watch();
            }
            // 2.失去焦点,结束监听
            let watchEndE = () => {
                this.stopListen = 0;
            }
            //  输入中文之前,设置标记为正在输入中,更具此标志,不执行input值比较
            let zhTypingStart = () => {
                this.zhTyping = 1;
            }
            //  输入中文之后.这时才执行input值的比较
            let zhTypingEnd = () => {
                this.zhTyping = 0;
            }

            // bind event
            this.addEventListener('focus', watchStartE);
            this.addEventListener('blur', watchEndE);
            this.addEventListener('compositionstart', zhTypingStart);
            this.addEventListener('compositionend', zhTypingEnd);

            // == fun ==
            // 删除监听并且解绑所有事件
            //this.clear = () => {
            //    this.removeEventListener('focus', watchStartE);
            //    this.removeEventListener('blur', watchEndE);
            //    this.removeEventListener('compositionstart', zhTypingStart);
            //    this.removeEventListener('compositionend', zhTypingEnd);
            //    this.stopListen = 0;
            //}
        }
        watch() {
            if (this.stopListen == 0) {
                //console.log('停止监听!');
                return;
            }
            let val = this.value.replace(/^\s*|\s*$/g, '');
            //console.log(`lastvalue: ${this.lastValue} value: ${val}`);
            if (this.zhTyping == 0 && val != this.lastValue) {
                this.lastValue = val;
                if (typeof this.changeE == 'function')
                    this.changeE(val, this);
                //console.log('监听到变化');
            } else {
                //console.log('监听中...');
            }
            setTimeout(() => {
                this.watch()
            }, this.timeout);
        }
    }, { extends: 'input' });
})(window);