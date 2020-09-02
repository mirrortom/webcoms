//================================================================================//
// 模仿jquery的封装库.由于jsAPI大多比较长,为了简洁封装一些常用的js函数.如dom操作,数组操作等等
// 主要定义函数 "jslib" ,window上的引用名字 "lib"
// jslib是一个类数组对象,用function定义的,和jquery类似,方法名也大多数使用jquery的方法名.
// 使用方法如: lib('#id').addClass('acitve')
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
     * jslib类数组中是否已有指定元素
     * @param {any} item 指定node节点
     * @returns {boolean} 返回 t / f
     */
    jslib.prototype.contains = function (item) {
        for (let i = 0, len = this.length; i < len; i++) {
            if (this[i] === item)
                return true;
        }
        return false;
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
 * 由于innerhtml中包含的script不能执行,分析html字符串时,对script标签会重新生成.外联的script会发请求取js,然后变成内联的.
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
     * @param {any[]} content node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    'append': function (...content) {
        this.each((dom) => {
            _parseHtml(content, (fragment) => {
                dom.append(fragment);
            });
        });
        return this;
    },
    /**
     * 向每个匹配元素内部第一子节点前面加入内容(原生: prepend())
     * @param {any[]} content node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    'prepend': function (...content) {
        this.each((dom) => {
            _parseHtml(content, (fragment) => {
                dom.prepend(fragment);
            });
        });
        return this;
    },
    /**
     * 向每个匹配元素的前面加元素(原生: insertBefore())
     * @param {any[]} content node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    'before': function (...content) {
        this.each((dom) => {
            _parseHtml(content, (fragment) => {
                dom.parentNode.insertBefore(fragment, dom);
            });
        });
        return this;
    },
    /**
     * 向每个匹配元素的后面加元素(原生: insertBefore())
     * @param {any[]} content node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    'after': function (...content) {
        this.each((dom) => {
            _parseHtml(content, (fragment) => {
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
// ==================================================
// jslib实例方法 事件
// ==================================================
factory.extend({
    /**
     * 匹配元素的点击事件,不传fn时执行事件
     * @param {Function} fn 事件方法
     * @returns {jslib} 返回this
     */
    'click': function (fn) {
        if (typeof fn === "function") {
            this.each((item) => {
                let eventEle = item;
                eventEle.onclick = () => {
                    fn(eventEle);
                };
            });
        } else {
            this.each((item) => {
                item.click();
            });
        }
        return this;
    }
});
// ==================================
//           数组相关操作方法
// ==================================
// ==================================
//           字符串相关方法
// ==================================
/**
 * 字符串是否为空或者null.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isEmptyOrNull = (str) => {
    return !str || str.length === 0;
};
/**
 * 字符串是否为空或者null或者全是空白字符.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isNullOrWhiteSpace = (str) => {
    if (/^\s+$/.test(str)) return true; // 全部是空白字符
    return !str || str.length === 0;
};
/**
 * 格式化字符串,将字符串中的占位符替换为给定字符串{d},返回替换后字符串.例:("my name is {0} from {1}",mirror,china)
 * @param {string} str 要格式化的字符串,包含占位符{d}
 * @param {...any} repstrs 替换占位符的字符串数组
 * @returns {string} 返回替换后字符串
 */
factory.format = (str, ...repstrs) => {
    // 替换函数的参数m表示匹配到的字串,j表示正则中圆括号捕获的值(就是占位数字).用这数字当下标到填充值数组取值,作为替换串返回
    return str.replace(/\{(\d+)\}/g, function (m, j) { return repstrs[j]; });
};
/**
 * 格式化字符串,根据占位符${key},到json中找到json.key,然后替换掉${key}
 * @param {string} str 要格式化的字符串,包含占位符${key}
 * @param {any} json json对象,键为key
 * @returns {string} 返回替换后字符串
 */
factory.dataBind = (str, json) => {
    
    // 根据指定的key,到data中取值,然后替换掉${key}
    // 其中m表示找到的'${key}', key表示圆括号中的值(属性名)
    // 没找到的'${key}'时, ${key}替换为''(空值)
    return str.replace(/\${(.+?)\}/g, function (m, key) { return json.hasOwnProperty(key) ? json[key] : ''; });
};
/**
 * 去除字符串前后的空白字符
 * @param {string} str 字符串
 * @returns {string} 返回新字符串
 */
factory.trim = (str) => {
    return str.replace(/^\s*|\s*$/g, '');
};
// ==================================
//           随机数相关方法
// ==================================
/**
 * 生成一个非负随机整数
 * @param {number} intMin 起始值(>0整数,含)
 * @param {number} intMax intMax:结束值(大于起始值整数,不含)
 * @returns {number} 返回
 */
factory.nextInt = (intMin, intMax) => {
    let rand = Math.random() * (intMax - intMin);
    return Math.floor(rand) + intMin;
};
// ==================================
//           时间相关方法
// ==================================
/**
 * 格式化时间,
 * @param {Date} date 要格式化的Date对象
 * @param {string} fmtstr format string 格式化字符串 (默认:四位年份,24小时制: "yyyy/MM/dd HH:mm:ss").
 * 自定义格式时,年月日时分秒代号必须是: y(年)M(月)d(日)H(时)m(分)s(秒)
 * @returns {string} 返回格式化时间字符串
 */
factory.datefmt = (date, fmtstr) => {
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

/**
 * 将时间字符串转换为Date对象.
 * 支持格式: yyyy/mm/dd yyyy-mm-dd yyyy/mm/dd hh:mm:ss 时分秒可省略自动补0,年月日必须.年份4位月日时分秒支持1位.
 * @param {string} fmtstr 时间格式的字符串
 * @returns {Date|null} 成功时返回Date对象,失败返回null
 */
factory.dateByfmt = (fmtstr) => {
    let dtstr = '';
    if (/^[0-9]{4}[\/\-][0-9]{1,2}[\/\-][0-9]{1,2}$/.test(fmtstr)) {
        // 年月日
        dtstr = fmtstr + ' 00:00:00';
    } else if (/^[0-9]{4}[\/\-][0-9]{1,2}[\/\-][0-9]{1,2} [0-9]{1,2}$/.test(fmtstr)) {
        // 年月日时
        dtstr = fmtstr + ':00:00';
    } else if (/^[0-9]{4}[\/\-][0-9]{1,2}[\/\-][0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}$/.test(fmtstr)) {
        // 年月日时分
        dtstr = fmtstr + ':00';
    } else if (/^[0-9]{4}[\/\-][0-9]{1,2}[\/\-][0-9]{1,2} [0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/.test(fmtstr)) {
        // 年月日时分秒
        dtstr = fmtstr;
    } else
        throw new Error('invalid date fmt!');
    //console.log(dtstr);
    // 不带时间部分的日期串,用parse解后,会有时差.
    let inputDate = Date.parse(dtstr);
    return isNaN(inputDate) ? null : new Date(inputDate);
};
// ==================================
//           验证相关方法
// ==================================
/**
 * 指示一个字符串是否含有内容,并且不能全部是空白字符
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isNotNull = (str) => {
    return !factory.isNullOrWhiteSpace(str);
};
/**
 * 指示一个字符串是否为数值
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isNumber = (str) => {
    if (!str || str.length === 0) return true;
    return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(str);
};
/**
 * 指示一个字符串是否为email地址
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isEmail = (str) => {
    if (!str || str.length === 0) return true;
    return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(str);
};
/**
 * 指示一个字符串是否为国内11位手机号
 * [可匹配"(+86)013800138000",()号可以省略，+号可以省略，(+86)可以省略,11位手机号前的0可以省略;11位手机号第二位数可以是3~9中的任意一个]
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isMobile = (str) => {
    if (!str || str.length === 0) return true;
    return /^(\((\+)?86\)|((\+)?86)?)0?1[^012]\d{9}$/.test(str);
};
/**
 * 指示一个字符串是否为26个英文字母组成,大小写不限.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isAbc = (str) => {
    if (!str || str.length === 0) return true;
    return !/[^a-zA-Z]/.test(str);
};
/**
 * 指示一个字符串是否为0-9整数组成
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isDigit = (str) => {
    if (!str || str.length === 0) return true;
    return /^\d+$/.test(str);
};
/**
 * 指示一个字符串是否为26个英文字母和0-9整数(可选)组成,但必须是字母开头.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isAbcDigit = (str) => {
    if (!str || str.length === 0) return true;
    return /^[a-zA-Z][a-zA-Z\d]*$/.test(str);
};
/**
 * 指示一个字符串是否为26个英文字母和0-9整数(可选)和_下划线(可选)组成,并且是字母或者下划线开头.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isAbcDigitUline = (str) => {
    if (!str || str.length === 0) return true;
    return /^[a-zA-Z_][a-zA-Z\d_]*$/.test(str);
};
/**
 * 指示一个字符串是否为url
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isUrl = (str) => {
    if (!str || str.length === 0) return true;
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str);
};
/**
 * 指示一个字符串是否为ipv4
 * @param {any} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isIpv4 = (str) => {
    if (!str || str.length === 0) return true;
    return /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str);
};
/**
 * 指示一个字符串长度是否超过maxlength.
 * @param {string} str 被检查字符串
 * @param {int} maxlen 最大长度
 * @returns {boolean} t/f
 */
factory.isMaxLength = (str, maxlen) => {
    if (!str || str.length === 0) return true;
    return str.length > maxlen;
};
/**
 * 指示一个字符串长度是否小于minlength
 * @param {string} str 被检查字符串
 * @param {int} minlen 最小长度
 * @returns {boolean} t/f
 */
factory.isMinLength = (str, minlen) => {
    if (!str || str.length === 0) return true;
    return str.length < minlen;
};

/**
 * 指示一个字符串是否为1~3位小数,或者正数 (d | d.dd | d.d | d.ddd),可用于金额
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isMoney = (str) => {
    if (!str || str.length === 0) return true;
    return /^-?[0-9]+([.]{1}[0-9]{1,3})?$/.test(str);
};
/**
 * 指示一个字符串是否为日期格式
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isDate = (str) => {
    if (!str || str.length === 0) return true;
    return !/Invalid|NaN/.test(new Date(str).toString());
};
// window上的引用名 "lib",.在此修改
win.lib = factory;
// 用$更加简洁方便
if (!win.$)
    win.$ = win.lib;
}) (window);
((win) => {
    // 验证类型.每个类型对应一个完成验证功能的函数
    const vType = {
        // 必要项且不能为空或空白字符
        'notnull': 'isNotNull',
        // 电子邮件格式
        'email': 'isEmail',
        // 指示一个字符串是否为国内11位手机号
        // [可匹配"(+86)013800138000",()号可以省略，+号可以省略，(+86)可以省略, 11位手机号前的0可以省略; 11位手机号第二位数可以是3~9中的任意一个]
        'mobile': 'isMobile',
        // 限26个英文,大小写不限.
        'abc': 'isAbc',
        // 限0-9数字
        '123': 'isDigit',
        // 限26个英文字母(开头)和0-9整数(可选)
        'abc123': 'isAbcDigit',
        // 限26个英文字母和0-9整数(可选)和_下划线(可选),并且是字母或者下划线开头.
        'abc_123': 'isAbcDigitUline',
        // 限url
        'url': 'isUrl',
        // 限ipv4
        'ipv4': 'isIpv4',
        // 标准日期 "1999-02-28 12:08:33"
        'date': 'isDate',
        // 是否超长度限制
        'maxlen': 'isMaxLength',
        // 是否小于长度
        'minlen': 'isMinLength',
        // 正整数或正1-3位小数
        'money': "isMoney"
    };
    // 表单元素错误提示样式类,提示语样式类
    const inputCls = 'formcheck-err',
        errmsgCls = 'formcheck-errmsg';
    //
    let _$ = win.lib;
    /**
     * 清除表单元素的错误样式和提示语.
     * @param {HTMLElement|any} elem input,textarea元素
     */
    _$.formClear = (elem) => {
        if (_$(elem).hasClass(inputCls)) {
            _$(elem).next('.' + errmsgCls).remove();
            elem.style.backgroundColor = null;
            elem.parentNode.style.position = null;
        }
        elem.removeEventListener('focus', _$.formClear);
    };
    // 
    /**
     * 生成表单元素验证出错时的错误样式和提示语: 背景变红,在其正下方生成span,显示提示语
     * @param {HTMLElement|any} elem input,textarea元素
     * @param {string} msg 提示语
     */
    _$.formAlert = (elem, msg) => {
        let bgColor = '#ffebec', fgColor = '#e6393d';
        // input加背景色
        _$(elem).addClass(inputCls);
        elem.style.backgroundColor = bgColor;
        // input父级相对定位
        elem.parentNode.style.position = 'relative';
        // 显示提示语的span.其长度,背景色与input相同.显示在input正下方,对齐input左边
        let errmsg = _$('<span>').addClass(errmsgCls).text('⛔ ' + msg)[0];
        errmsg.style.cssText = _$.format(
            'position:absolute;top:{0}px;left:{1}px;padding:3px;background-color:{2};color:{3};width:{4}px',
            elem.offsetTop + elem.offsetHeight, elem.offsetLeft, bgColor, fgColor, elem.offsetWidth);
        _$(elem).after(errmsg);
        // 焦点事件
        elem.addEventListener('focus', () => { _$.formClear(elem) });
    };
    /**
     * 验证表单元素的值
     * @param {HTMLElement|any} elem input,textarea元素
     * @returns {boolean} t/f 
     */
    _$.formCheck = (elem) => {
        // 1.验证准备
        // 获取验证类型和错误提示语.元素上的vtype属性值(多个验证用|隔开).未找到或者类型错误则退出
        let vtypeStr = elem.getAttribute('vtype');
        // 没有在要验证的元素上设置vtype属性,忽略并通过
        if (_$.isNullOrWhiteSpace(vtypeStr))
            return true;

        //
        let validtype = vtypeStr.split("|");
        // 如果检测到一个验证类型无效,丢异常
        for (var i = 0, len = validtype.length; i < len; i++) {
            if (!vType.hasOwnProperty(validtype[i]))
                throw 'vtype value wrong: ' + validtype[i];
        }

        // 自定义的错误提示信息,多个也是|号分开.与vtype索引对应
        let validerrmsg = [],
            verrmsgStr = elem.getAttribute('verrmsg');
        if (!_$.isNullOrWhiteSpace(verrmsgStr))
            validerrmsg = verrmsgStr.split("|");

        // 长度验证参数来自input上的maxlength,minlength属性值
        let maxlen = elem.getAttribute('maxlength');
        let minlen = elem.getAttribute('minlength');
        // 验证前清除旧的提示语span(如果有)
        _$.formClear(elem);
        // 2.开始验证
        for (var n = 0, nlen = validtype.length; n < nlen; n++) {
            // 执行验证的函数名字
            let vfunname = vType[validtype[n]];
            // 验证
            let isValid = _$[vfunname](elem.value);
            if (validtype[n] === 'minlen')
                isValid = !_$[vfunname](elem.value, minlen);
            else if (validtype[n] === 'maxlen')
                isValid = !_$[vfunname](elem.value, maxlen);
            if (!isValid) {
                _$.formAlert(elem, validerrmsg[n] || 'validation failed: ' + validtype[n]);
                return false;
            }
        }
        //
        return true;
    };
    /**
     * 将一个父元素中的所有含有name属性的input,select,textarea子元素,将其name值为属性名,value值为属性值,组成一个json对象返回.
     * @param {HTMLElement} parent 容器元素dom对象
     * @returns {any} json对象
     */
    _$.formJson = (parent) => {
        let nodelist = parent.querySelectorAll("input[name],select[name],textarea[name]");
        let json = {};
        nodelist.forEach((item) => {
            // 如果json中已经添加了这个属性(这里是防止相同name值,如果发现则变数组)
            if (json.hasOwnProperty(item.name)) {
                if (json instanceof Array)// 如果这个属性是数组
                {
                    json[item.name].push(item.value);// 往后加入值
                }
                else {
                    json[item.name] = [json[item.name]];// 不是数组说明该元素当前有一个值,将其变数组并置此值于其中
                    json[item.name].push(item.value);// 然后往后加入新值
                }
            }
            else {
                json[item.name] = item.value;// 加入键值对
            }
        });
        return json;
    };
})(window);
// ====================================================================
// ajax (原生: fetch())
// fetch方法返回Promise对象.
// https://github.com/matthew-andrews/isomorphic-fetch
// (详细讲解)https://www.cnblogs.com/libin-1/p/6853677.html
// ====================================================================
((win) => {
    /**
     * 简易post方式Ajax,对参数做了包装,第一个then()对请求结果判断成败,丢出异常. 内部使用fetch()方法,外部可以继续使用then(),catch().
     * @param {string} url 请求url
     * @param {any|FormData} data json对象或者FormData对象,如果是json对象,会转化成FormData对象
     * @param {RequestInit} initCfg fetch请求配置对象.例如传headers:{'Auth':'xxx'}用来验证
     * @param {string} resType 返回值类型 默认"json",可选"html"
     * @returns {Promise} fetch().then()返回的Promise对象
     */
    win.lib.post = (url, data, initCfg = null, resType = 'json') => {
        let formData = new FormData();
        if (data instanceof FormData) {
            formData = data;
        } else {
            Object.keys(data).forEach((key) => {
                formData.append(key, data[key]);
            });
        }
        let init = { method: "POST", body: formData };
        if (initCfg) {
            Object.keys(initCfg).forEach((key) => {
                init[key] = initCfg[key];
            });
        }
        //
        return fetch(url, init)
            .then(res => {
                if (res.ok)
                    return resType != 'json' ? res.text() : res.json();
                else
                    return res.text();
            });
    };
    /**
     * 简易 get方式Ajax,对para参数转换为url参数,对请求结果判断成败. 使用fetch()方法,外部可以继续使用then(),catch().
     * @param {string} url 请求url
     * @param {any|FormData} para json对象或者FormData对象,转化为url参数
     * @param {RequestInit} initCfg fetch请求配置对象.例如传headers:{'Auth':'xxx'}用来验证
     * @param {string} resType 返回值类型 默认"html",可选"json"
     * @returns {Promise} fetch()方法返回的Promise对象
     */
    win.lib.get = (url, para, initCfg = null, resType = 'html') => {
        let urlpara = [];
        if (para) {
            if (para instanceof FormData) {
                para.forEach((val, key) => {
                    urlpara.push(`${key}=${val}`);
                });
            } else {
                Object.keys(para).forEach((key) => {
                    urlpara.push(`${key}=${para[key]}`);
                });
            }
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += urlpara.join('&');
        }
        let eurl = encodeURI(url);
        return fetch(eurl, initCfg)
            .then(res => {
                if (res.ok)
                    return resType != 'html' ? res.json() : res.text();
                else
                    return res.text();
            });
    };
})(window);