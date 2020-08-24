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
                if (!this.contains(item))
                    this.push(item);
            });
        }
        return this;
    };
    /**
     * 遍历jslib类数组元素.如果dom元素无效,不会执行函数
     * @param {Function} fn fn(item,index),fn返回false时,循环break,返回true时,循环continue
     */
    jslib.prototype.each = function (fn) {
        for (let i = 0, len = this.length; i < len; i++) {
            if (!this[i]) continue;
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
     * 设置所有匹配的元素的innerTEXT.无参数时,返回第一个元素的innerText内容(原生: innerText)
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
// window上的引用名 "$ui",外部使用
win.$ui = factory;
}) (window);
/*====================================================================================*
 * 处理表单元素的一些辅助方法.例如文件选择框选中文件时,将文件名显示在文件框标题上,
 * 使用这些方法时,一般是绑定到表单元素的事件上,例如change,blur等事件.
 * 所有辅助方法都绑定到$ui这个对象上,调用时 $ui.fn(参数);
 *====================================================================================*/
((win) => {
    // 文件选择框选择后,将文件名显示在标签上.可绑定到input-file的onchange方法,传参this
    win.$ui.inputFileChange = (inputfileDom) => {
        let fnlist = '';
        [].forEach.call(inputfileDom.files, (item) => {
            fnlist += item.name + ',';
            //console.dir(item);
        });
        fnlist = fnlist.substr(0, fnlist.length - 1);
        let labelDom = inputfileDom.parentNode.querySelector('.input-file-label');
        labelDom.innerHTML = fnlist;
    };
    // 清空文件选择框
    win.$ui.clsInputFile = (inputfileDom) => {
        // 标签清空一定要先执行,然后再执行文件框清空.
        // 如果反过来执行,那么inputfileDom就会找不到对象,因为outterHTML相当于换一个input
        let labelDom = inputfileDom.parentNode.querySelector('.input-file-label');
        labelDom.innerHTML = '';
        inputfileDom.outerHTML = inputfileDom.outerHTML;
    };
    // 判断btn是否含有loading样式.如果没有会添加上等待样式
    win.$ui.isBtnLoading = (btn) => {
        if (btn.classList.contains('loading'))
            return true;
        btn.classList.add('loading');
        return false;
    };
    // 去掉btn的loading样式.time是豪秒数,表示经过此时间后去掉loading样式
    win.$ui.clsBtnLoading = (btn, time) => {
        if (time >= 0) {
            setTimeout(() => {
                btn.classList.remove('loading');
            }, time);
        } else {
            btn.classList.remove('loading');
        }
    };
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
    const M = win.$ui;
    // 生成选项卡和功能区DOM,添加到容器内
    /* html内容:
        <a class="tabsbox-left"></a>
        <nav class="tabsbox-navbox">
          <div class="tabsbox-nav"></div>
        </nav>
        <a class="tabsbox-right"></a>
        <span class="tabsbox-menutitle">功能</span>
        <div class="tabsbox-menugroup">
          <span class="tabsbox-goto-active">定位当前页</span>
          <span class="tabsbox-close-all">关闭全部</span>
          <span class="tabsbox-close-other">关闭其它</span>
        </div>
     */
    let createTabDom = (tabsDom) => {
        let fragment = M.fragment();
        fragment.append(M('<a>').addClass('tabsbox-left')[0]);
        fragment.append(M('<nav>').addClass('tabsbox-navbox').append(M('<div>').addClass('tabsbox-nav')[0])[0]);
        fragment.append(M('<a>').addClass('tabsbox-right')[0]);
        fragment.append(M('<span>').addClass('tabsbox-menutitle').text('功能')[0]);
        let menugroup = M('<div>').addClass('tabsbox-menugroup').append(
            M('<span>').addClass('tabsbox-goto-active').text('定位当前页')[0],
            M('<span>').addClass('tabsbox-close-all').text('关闭全部')[0],
            M('<span>').addClass('tabsbox-close-other').text('关闭其它')[0]
        )[0];
        fragment.append(menugroup);
        M(tabsDom).append(fragment).addClass('tabsbox');
    };
    // 初始化cachepage实例(工厂函数)
    // tabsDom:选项卡容器DOM,contDom:显示内容的容器DOM
    let cachePage = (tabsDom, contDom) => {
        //
        if (!tabsDom || !contDom) throw '必须传入DOM对象';
        // 缓存页对象
        let self = {};
        // 缓存器,{c_id:createDocumentFragment片断,c_id2:null},值为null的表示当前活动页,只能有一个
        let cache = {};
        // 生成选项卡工具dom
        createTabDom(tabsDom);

        //====================================================================================
        // 主要方法 载入新页面需要调用的方法,做了更新选项卡状态和DOM缓存状态.在菜单的点击事件上执行次方法.
        // 该方法第3个参数onload(loadType)是一个方法,可以根据loadType参数值判断是否要载入新的页面
        // loadType=1: 菜单是当前页面
        // loadType=2: 菜单之前载入过
        // loadType=3: 是新载入菜单,其对应的页面没有载入过,需要做载入新页面的操作
        //====================================================================================
        // {pid:菜单唯一标识,title:选项卡标题},点击左侧菜单时,调用此方法
        self.load = (pid, title, onload) => {
            if (!title) {
                throw 'tab title is empty!';
            }
            // (情形1) 如果载入的是当前活动的选项卡页,不动作
            if (cache[pid] === null) {
                // console.log('type1');
                if (typeof onload === 'function')
                    onload(1);
                return;
            }
            // (情形2)激活选项卡.如果pid已添加过,则到缓存中取出页面显示在contDom中,激活对应选项卡.
            if (cache[pid]) {
                // 切换活动选项卡状态
                let atabdom = activeTab(pid);
                // 选项卡位置调整到可见区域
                adjustPositionTab(atabdom);
                // 添加当前DOM到缓存
                cacheActiveTab();
                // 取出pid对应的DOM片段,放入显示容器
                M(contDom).html(cache[pid]);
                // 标识为null,表示pid成为新的活动页
                cache[pid] = null;
                // console.log('type2');
                if (typeof onload === 'function')
                    onload(2);
                return;
            }
            // (情形3)新增加选项卡
            // 增加选项卡
            addTab(pid, title);
            // 选项卡框滚动条移动到最后
            scrollerTabs(1);
            // 当增加的是第1个选项卡时,没有活动页面,不需要缓存
            if (Object.getOwnPropertyNames(cache).length > 0) {
                cacheActiveTab();
            }
            // 添加到缓存.当前活动页缓存约定为null,不缓存
            cache[pid] = null;
            // console.log('type3');
            if (typeof onload === 'function')
                onload(3);
            //return;
        };

        //==================
        // Mehtod
        //==================
        // 新增选项卡
        let addTab = (pid, title) => {
            // 去掉当前活动的选项卡
            let activeTabDom = M(tabsDom).find('.tabsbox-tab.active');
            if (activeTabDom.length > 0) {
                activeTabDom.removeClass('active');
            }
            let tabdom = M('<label>').addClass('tabsbox-tab', 'active').prop({ 'title': title, 'val': pid })
                .html(title).append(M('<a>').addClass('tabsbox-tabclose').prop('title', '关闭').text('×')[0])[0];
            // 绑定X关闭事件
            closeTab(tabdom);
            // 绑定点击事件
            selectedTab(tabdom);
            // 添加到选项卡容器
            M(tabsDom).find('.tabsbox-nav').append(tabdom);
        };
        // 切换激活选项卡.然后返回活动tab的Dom对象
        let activeTab = (pid) => {
            // 去掉当前活动的选项卡
            let activeTabDom = M(tabsDom).find('.tabsbox-tab.active');
            if (activeTabDom.length > 0) {
                activeTabDom.removeClass('active');
            }
            // 添加pid选项卡活动样式
            let tabDom = M(tabsDom).find(".tabsbox-tab[val='" + pid + "']").addClass('active')[0];
            return tabDom;
        };

        // 将活动页内容DOM添加到缓存.(缓存当前页面)
        let cacheActiveTab = () => {
            // 找到cache中null值的键,将显示容器div中的所有元素添加DOM片段后,赋值
            for (let prop in cache) {
                if (cache.hasOwnProperty(prop)) {
                    if (cache[prop] === null) {
                        cache[prop] = M.fragment(...contDom.childNodes);
                        return;
                    }
                }
            }
        };
        // 调整选项卡框的滚动条值,使选项卡显示在合适的位置上
        // len:滚动距离,>0 : 向右滚此距离, <0 : 向左滚, 0 : 滚动到最左, 1 : 到最右,
        //              'left': 左滚固定距离, 'right': 右滚固定距离
        let scrollerTabs = (len) => {
            let navDom = M(tabsDom).find('.tabsbox-nav')[0];
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

        // 调整选项卡框的滚动条值,使指定选项卡处于中间位置.
        let adjustPositionTab = (tabDom) => {
            let navDom = M(tabsDom).find('.tabsbox-nav')[0];
            // 界限值89px,大致是一个按钮的宽度
            let tabLen = 89;
            // 滚动条位置
            // let sPosition = navDom.scrollLeft;
            // nav宽度
            let w = navDom.clientWidth;
            // nav文档长度
            // let swidth = navDom.scrollWidth;
            // 该选项卡离选项卡框左起位置
            let tabLeft = tabDom.offsetLeft;
            // 让tab位于navdom的中间位置,算法如下:定位到tab离左边距离,再减去navDom宽度的一半
            navDom.scrollTo(tabLeft - (w / 2), 0);
        };

        //======================================================
        // Event 选项卡事件
        //======================================================
        // 点击关闭选项卡
        let closeTab = (tabDom) => {
            M(tabDom).find('.tabsbox-tabclose')[0].onclick = (event) => {
                event.stopPropagation();
                // (情形1)关闭的是最后一个tab页,删除tab,清空缓存
                if (Object.getOwnPropertyNames(cache).length == 1) {
                    // 删除选项卡,删除缓存,清空显示容器
                    contDom.innerHTML = '';
                    cache = {};
                    M(tabDom).remove();
                    return;
                }
                // (情形2)关闭时,多于1个tab页时
                // 清除对应缓存,
                let cacheId = M(tabDom).prop('val');
                delete cache[cacheId];
                // 如果关闭的是活动页,将cache中最后一个id,对应的选项卡激活,对应DOM载入显示容器
                if (M(tabDom).hasClass('active')) {
                    let cacheId = Object.getOwnPropertyNames(cache).pop();
                    let lastTabDom = M(tabsDom).find(".tabsbox-tab[val='" + cacheId + "']").addClass('active');
                    M(contDom).html(cache[cacheId]);
                    cache[cacheId] = null;
                }
                // 删除tab,
                M(tabDom).remove();
            };
        };
        // 点击选项卡
        let selectedTab = (tabDom) => {
            tabDom.onclick = () => {
                // 点击选项卡时,位置会相应调整,确保点击的选项卡完全显示在父级的可见区域.
                adjustPositionTab(tabDom);

                // (情形1)点击的是活动页面,退出
                if (M(tabDom).hasClass('active'))
                    return;

                // (情形2)非活动页面,即切换行为
                // 缓存当前DOM
                cacheActiveTab();
                // 去掉当前活动的选项卡活动状态
                let activeTabDom = M(tabsDom).find('.tabsbox-tab.active');
                if (activeTabDom.length > 0) {
                    activeTabDom.removeClass('active');
                }
                // 激活点击的选项卡,获取其缓存页加载到显示容器
                let cacheId = M(tabDom).addClass('active').prop('val');
                M(contDom).html(cache[cacheId]);
                cache[cacheId] = null;
                //console.log(cache);
            };
        };
        //======================================================
        // Event 选项卡条功能事件
        //======================================================
        // 向左滚动按钮
        M(tabsDom).find('.tabsbox-left')[0].onclick = () => {
            scrollerTabs('left');
        };
        // 向右滚动按钮
        M(tabsDom).find('.tabsbox-right')[0].onclick = () => {
            scrollerTabs('right');
        };

        // 定位当前按钮
        M(tabsDom).find('.tabsbox-goto-active')[0].onclick = () => {
            let activeTab = M(tabsDom).find('.active')[0];
            if (!activeTab) return;
            adjustPositionTab(activeTab);
        };
        // 关闭全部选项卡
        M(tabsDom).find('.tabsbox-close-all')[0].onclick = () => {
            // 删除选项卡,删除缓存,清空显示容器
            let navDom = M(tabsDom).find('.tabsbox-nav').empty();
            contDom.innerHTML = '';
            cache = {};
        };
        // 关闭除当前外所有选项卡
        M(tabsDom).find('.tabsbox-close-other')[0].onclick = () => {
            // 删除选项卡除活动的外
            let navDom = M(tabsDom).find('.tabsbox-nav .tabsbox-tab:not(.active)').remove();
            // 除了为null的都删除掉,null是当前页特征
            for (let prop in cache) {
                if (cache.hasOwnProperty(prop)) {
                    if (cache[prop] === null)
                        continue;
                    delete cache[prop];
                }
            }
        };
        return self;
    };
    win.cachepage = cachePage;
})(window);
/**
 * 模拟系统的弹出框 alert confirm prompt
 * 显示在上中下三个位置
 * 用于理解弹出框原理
 */
((win) => {
    // 遮罩样式命
    const shadowCls = 'msgbox-shadow';
    // 弹出层父级样式名
    const modalCls = 'msgbox-modal';
    // 弹出层样式名
    const msgboxCls = 'msgbox';
    // 帮助函数
    const M = win.$ui;
    /**
     * 生成遮罩并显示,生成并返回弹出层父级DOM对象
     * @returns {HTMLElement} 弹出层父级DOM对象
     */
    let createMsgBox = () => {
        // 添加遮罩层
        let shadow = M('<div>').addClass(shadowCls)[0];
        document.body.append(shadow);
        // 生成弹出框
        let parentDiv = M('<div>').addClass(modalCls)[0];
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
     * @param {string} style 样式风格:primary | danger | success
     * @param {string} position 位置:top | bottom
     * @returns {HTMLElement} 返回外层div元素
     */
    let createOuterDiv = (msg, style, position) => {
        // 样式风格,位置样式
        let outerDiv = M('<div>').addClass(msgboxCls, 'msgbox-' + (position || 'center'));
        style && outerDiv.addClass(style);
        // 内容
        outerDiv.text(msg || '');
        return outerDiv[0];
    };
    /**
     * 生成标准按钮:确定,取消
     * @param {string} name 按钮风格 ok|cancel
     * @returns {HTMLElement} 返回按钮dom
     */
    let createBtn = (name) => {
        let btn = M('<span>').addClass('msgbox-btn', 'msgbox-' + name).text(name === 'ok' ? '确定' : '取消');
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
     * @param {string} style 样式风格:primary | danger | success
     * @param {string} position 位置:top | bottom
     */
    msgBox.alert = (msg, onClosed, style, position) => {
        // 删除可能存在的弹出框
        msgBox.close();
        // 生成遮罩层和弹出层父级,并且加入到body直属
        let parentDiv = createMsgBox();
        // 生成alertDom: 
        // <div class="msgbox 样式? 位置?">内容<span class="msgbox-btn msgbox-ok">OK</span></div>
        let alertDom = createOuterDiv(msg, style, position);
        // 按钮
        let okBtn = createBtn('ok');
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
     * @param {string} style 样式风格:primary | danger | success
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
        let confirmDom = createOuterDiv(msg, style, position);
        // 按钮
        let okBtn = createBtn('ok');
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
     * @param {string} style 样式风格:primary | danger | success
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
        let promptDom = createOuterDiv(msg, style, position);
        // input框
        let inputE = M('<input>').addClass('msgbox-input').prop('type', 'text')[0];
        // 按钮
        let okBtn = createBtn('ok');
        let cancelBtn = createBtn('cancel');
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
            onBefore();
    };

    // 引用名称可在此修改
    win.msgbox = msgBox;
})(window);
/*
日期组件,是一个函数.
在input上使用此方法. <input onclick="MyDatePick()" />,需要时间部分: MyDatePick({fmt:datetime})
 */
((win) => {
    // datebox样式类名
    const dateboxCls = 'date-box';
    // 最大最小年份
    const maxyear = 2100;
    const minyear = 1900;
    // 帮助函数
    const M = win.$ui;
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
        let ww = win.innerHeight;
        if (ww < 576) {
            thisleft = 0;
            thistop = '25vh';
        }

        // 清除可能已有的日期框
        M(document.body).find('.' + dateboxCls).remove();

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
        let ymtarea = M('<div>').addClass('date-area-ymt').append(createDom_Year()
            , createDom_Month(), createDom_Today())[0];

        let weekarea = M('<div>').addClass('date-area-week').append(createDom_Week())[0];

        let dayarea = M('<div>').addClass('date-area-day').append(createDom_Day())[0];

        let datedom = M('<div>').addClass('date-box').prop('tabIndex', -1)
            .append(ymtarea, weekarea, dayarea);
        // 时间区域,日期+时间格式类型时
        if (cfg.fmtType == 2) {
            let tcarea = M('<div>').addClass('date-area-tc').append(createDom_Time(), createDom_Clear(),
                createDom_Ok())[0];
            datedom.append(tcarea);
        }
        return datedom[0];
    };

    // 1.生成年份区内容 前进,后退,年份 按钮
    let createDom_Year = () => {
        let prevbtn = M('<a>').addClass('date-btn-prev').text('＜')[0];
        let yearbtn = M('<b>').addClass('date-btn-year').prop('val', cfg.year).text(cfg.year + '年')[0];
        let nextbtn = M('<a>').addClass('date-btn-next').text('＞')[0];
        return M('<div>').addClass('date-area-year').append(prevbtn, yearbtn, nextbtn)[0];
    };

    // 1.1生成年份下拉选择框. selectedYear:可指定一个年份为已选定
    let createDom_YearSelect = (selectedYear) => {
        let ydoms = '';
        let ylistData = domYear_Data();
        if (!selectedYear)
            selectedYear = (new Date()).getFullYear();
        //
        let dom = M('<div>').addClass('date-select-year');
        for (let i = 0; i < ylistData.length; i++) {
            let isselect = ylistData[i] == selectedYear ? "selected" : "";
            let itemtxt = ylistData[i];
            let itemdom = M('<b>').addClass('date-option-year', isselect).prop('val', itemtxt).text(itemtxt)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };

    // 2.生成月份区 前进,后退,月份 按钮
    let createDom_Month = () => {
        let prevbtn = M('<a>').addClass('date-btn-prev').text('＜')[0];
        let monthbtn = M('<b>').addClass('date-btn-month').prop('val', cfg.month).text(cfg.month + 1 + '月')[0];
        let nextbtn = M('<a>').addClass('date-btn-next').text('＞')[0];
        return M('<div>').addClass('date-area-month').append(prevbtn, monthbtn, nextbtn)[0];
    };

    // 2.1生成月份下拉选择框. selectedMonth:可指定一个月份为已选定
    let createDom_MonthSelect = (selectedMonth) => {
        let dom = M('<div>').addClass('date-select-month');
        for (let i = 0; i < 12; i++) {
            let isselect = selectedMonth == i ? "selected" : "";
            let itemdom = M('<b>').addClass('date-option-month', isselect).prop('val', i).text(i + 1)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };

    // 3.生成星期标题头
    let createDom_Week = () => {
        let weeksdom = M.fragment();
        let weeks = ['日', '一', '二', '三', '四', '五', '六'];
        for (let i = 0; i < weeks.length; i++) {
            let isweekend = (i === 0 || i === 6) ? 'date-item-weekend' : '';
            let itemdom = M('<b>').addClass('date-item-week', isweekend).text(weeks[i])[0];
            weeksdom.append(itemdom);
        }
        return weeksdom;
    };

    // 4.生成天选项 daylist:日数据.不传则使用选定年月计算出日
    let createDom_Day = (daylist) => {
        let data = daylist || domDay_Data();
        let fragment = M.fragment();
        for (var i = 0; i < data.length; i++) {
            let json = data[i];
            json.istoday = json.Istoday ? 'date-item-today' : '';
            json.isselected = json.Isselected ? 'selected' : '';
            json.isdayinmonth = json.Isdayinmonth ? '' : 'date-item-dayoutmonth';
            json.isweekend = json.Isweekend ? 'date-item-weekend' : '';
            //json.exportName = exportName;
            let daydom = M('<b>').addClass('date-item-day', json.istoday, json.isdayinmonth, json.isselected
                , json.isweekend).prop({ 'year': json.yyyy, 'month': json.MM, 'day': json.dd }).text(json.dd)[0];
            fragment.append(daydom);
        }
        return fragment;
    };
    // 5.生成时分秒区域
    let createDom_Time = () => {
        let hour = M('<b>').addClass('date-btn-time', 'date-btn-hour').text(cfg.hour)[0];
        let minute = M('<b>').addClass('date-btn-time', 'date-btn-minute').text(cfg.minute)[0];
        let second = M('<b>').addClass('date-btn-time', 'date-btn-second').text(cfg.second)[0];
        return M('<div>').addClass('date-area-time').append(hour, minute, second)[0];
    };
    // 5.1生成小时选择框
    let createDom_HourSelect = () => {
        let dom = M('<div>').addClass('date-select-hour');
        let title = ['凌晨', '上午', '下午', '夜晚'];
        for (let i = 0; i < 24; i++) {
            let itemdom = M('<b>').addClass('date-option-hour').prop('val', i).text(i)[0];
            if (i % 6 == 0)
                dom.append(M('<span>').addClass('date-option-title').text(title[i / 6])[0]);
            dom.append(itemdom);
        }
        return dom[0];
    };
    // 5.2生成分钟,秒钟选择框
    let createDom_MinuteSelect = () => {
        let dom = M('<div>').addClass('date-select-minute');
        for (let i = 0; i < 60; i++) {
            let itemdom = M('<b>').addClass('date-option-minute').prop('val', i).text(i)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };
    // 5.3生成秒钟选择框
    let createDom_SecondSelect = () => {
        let dom = M('<div>').addClass('date-select-second');
        for (let i = 0; i < 60; i++) {
            let itemdom = M('<b>').addClass('date-option-second').prop('val', i).text(i)[0];
            dom.append(itemdom);
        }
        return dom[0];
    };
    // 6.生成今天按钮区域
    let createDom_Today = () => {
        return M('<div>').addClass('date-area-today').html('<a class="date-btn-today">今天</a>')[0];
    };
    // 7.生成清除按钮区域
    let createDom_Clear = () => {
        return M('<div>').addClass('date-area-clear').html('<a class="date-btn-clear">清空</a>')[0];
    };
    // 8.生成确定按钮区域 
    let createDom_Ok = () => {
        return M('<div>').addClass('date-area-ok').html('<a class="date-btn-ok">确定</a>')[0];
    };

    // 根据选定的年,月刷新日(用于当在日期框上操作年,月等会改变年月的动作时)
    // yyyy:指定年,mm:指定月 daysdom:日的父级DOM的JQ对象(.daysrows)
    let resetDaysDom = (yyyy, mm) => {
        // 计算出指定年月的日数据
        let dayslist = domDay_Data(yyyy, mm);
        // 生成天DOM
        let daysdom = createDom_Day(dayslist);
        // 更新天DOM
        M(dateboxDom).find('.date-area-day').empty().append(daysdom);
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
            M(dateboxDom).find('[class^=date-select]').remove();
        };
    };
    let bindEvent_YearBtn = () => {
        // 点击年按钮 显示年选择框
        M(dateboxDom).find('.date-btn-year')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let seledY = M(thisobj).prop('val');
            // 年份选择框 .date-select-year
            let yearopsbox = M(thisobj.parentElement).find('.date-select-year');
            // 如果已经显示则关闭
            if (yearopsbox.length > 0) {
                yearopsbox.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherDoms = M(dateboxDom).find('[class^=date-select]');
            otherDoms.remove();
            // 生成年份选择框,填充到年份选择框中
            let yearSelectDom = createDom_YearSelect(seledY);
            thisobj.parentElement.append(yearSelectDom);
            // 定位已选年份到滚动框的中间(视口可见范围内)
            let yseled = M(yearSelectDom).find('.selected')[0];

            // 计算这个年份选项离父框的TOP值,然后滚动条滚动这个值-父框高/2
            let scrollval = yseled.offsetTop - yearSelectDom.clientHeight / 2;
            yearSelectDom.scrollTo(0, scrollval);
            // 绑定年份选择点击事件
            bindEvent_YearSelected();
        };
    };
    let bindEvent_MonthBtn = () => {
        // 点击月按钮 显示月选择框
        M(dateboxDom).find('.date-btn-month')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let seledM = M(thisobj).prop('val');
            let monthsops = M(thisobj.parentElement).find('.date-select-month');
            // 如果已经显示则关闭
            if (monthsops.length > 0) {
                monthsops.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherDoms = M(dateboxDom).find('[class^=date-select]');
            otherDoms.remove();
            //
            thisobj.parentElement.append(createDom_MonthSelect(seledM));
            // 绑定月分选项点击事件
            bindEvent_MonthSelected();
        };
    };
    let bindEvent_YearSelected = () => {
        // 点击年份选项 选定一个年份 
        M(dateboxDom).find('.date-option-year').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 
                // 所选年份值
                let y = M(thisobj).prop('val');
                // 更新年份按钮显示值
                M(dateboxDom).find('.date-btn-year').prop('val', y).text(y + '年');
                // 关闭年份选择框
                M(thisobj.parentElement).remove();
                // 刷新 日
                let m = M(dateboxDom).find('.date-btn-month').prop('val');
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_MonthSelected = () => {
        // 点击月份选项 选定一个月份
        M(dateboxDom).find('.date-option-month').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                // 
                // 所选月份值
                let m = parseInt(M(thisobj).prop('val'));
                M(dateboxDom).find('.date-btn-month').prop('val', m).text(m + 1 + '月');
                // 关闭月份选择框
                M(thisobj.parentElement).remove();
                // 刷新 日
                let y = M(dateboxDom).find('.date-btn-year').prop('val');
                resetDaysDom(y, m);
            };
        });
    };
    let bindEvent_YearMonthPrevNext = () => {
        // 点击年份,月份的前进和后退按钮 btntype:1=年按钮,2=月按钮. dir:1=前进,2=后退
        M(dateboxDom).find('.date-btn-prev,.date-btn-next').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let btntype = thisobj.parentElement.classList.contains('date-area-year') ? 1 : 2;
                let dir = thisobj.classList.contains('date-btn-next') ? 1 : 2;
                //
                let ybtn = M(dateboxDom).find('.date-btn-year');
                let mbtn = M(dateboxDom).find('.date-btn-month');
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
        M(dateboxDom).find('.date-btn-today')[0].onclick = (event) => {
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
        M(dateboxDom).find('.date-btn-hour')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let hourselecct = M(dateboxDom).find('.date-select-hour');
            // 点击小时按钮时,弹出小时选择框,同时,按钮加上打开样式,以表示当前选择的是小时
            // 添加样式时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = M(thisobj.parentElement).find('.date-btn-time').removeClass('open');
            // 如果已经是打开状态则关闭
            if (hourselecct.length > 0) {
                hourselecct.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherdoms = M(dateboxDom).find('[class^=date-select]');
            otherdoms.remove();
            // 显示小时选择框
            dateboxDom.append(createDom_HourSelect());
            M(thisobj).addClass('open');
            // 绑定小时选项点击事件
            bindEvent_HourSelected();
        };
    };
    let bindEvent_MinBtn = () => {
        // 点击分钟按钮 显示分钟选择框
        M(dateboxDom).find('.date-btn-minute')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let minselecct = M(dateboxDom).find('.date-select-minute');
            // 点击时分秒下拉框按钮时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = M(thisobj.parentElement).find('.date-btn-time').removeClass('open');
            // 如果已经显示则关闭
            if (minselecct.length > 0) {
                minselecct.remove();
                return;
            }
            // 先关闭其它弹出窗
            let otherdoms = M(dateboxDom).find('[class^=date-select]');
            otherdoms.remove();
            dateboxDom.append(createDom_MinuteSelect());
            M(thisobj).addClass('open');
            // 绑定分钟选项点击事件
            bindEvent_MinSelected();
        };
    };
    let bindEvent_SecBtn = () => {
        // 点击秒钟按钮 显示秒钟选择框
        M(dateboxDom).find('.date-btn-second')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            let secselecct = M(dateboxDom).find('.date-select-second');
            // 点击时分秒下拉框按钮时,先取消其按钮的打开样式,打开后,再给自己加上打开样式
            let otherBtns = M(thisobj.parentElement).find('.date-btn-time').removeClass('open');
            // 如果已经显示则关闭
            if (secselecct.length > 0) {
                secselecct.remove();
                return;
            }
            // 先关闭其它弹出窗
            M(dateboxDom).find('[class^=date-select]').remove();
            dateboxDom.append(createDom_SecondSelect());
            M(thisobj).addClass('open');
            // 绑定秒钟选项点击事件
            bindEvent_SecSelected();
        };
    };
    let bindEvent_HourSelected = () => {
        // 选择小时 修改小时按钮显示值
        M(dateboxDom).find('.date-option-hour').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let h = M(thisobj).prop('val');
                M(dateboxDom).find('.date-btn-hour').text(h);
                cfg.hour = h;
                //
                M(thisobj.parentElement).remove();
            };
        });
    };
    let bindEvent_MinSelected = () => {
        // 选择分钟 修改按钮显示值
        M(dateboxDom).find('.date-option-minute').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let m = M(thisobj).prop('val');
                M(dateboxDom).find('.date-btn-minute').text(m);
                cfg.minute = m;
                //
                M(thisobj.parentElement).remove();
            };
        });
    };
    let bindEvent_SecSelected = () => {
        // 选择秒钟 修改按钮显示值
        M(dateboxDom).find('.date-option-second').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let s = M(thisobj).prop('val');
                M(dateboxDom).find('.date-btn-second').text(s);
                cfg.second = s;
                //
                M(thisobj.parentElement).remove();
            };
        });
    };
    let bindEvent_DaySelected = () => {
        // 选择天 设置这天日期到Input框
        M(dateboxDom).find('.date-item-day').each((item) => {
            item.onclick = (event) => {
                event.stopPropagation();
                let thisobj = event.currentTarget;
                //
                let date = new Date(M(thisobj).prop('year'), M(thisobj).prop('month'), M(thisobj).prop('day'), cfg.hour, cfg.minute, cfg.second);
                inputDOM.value = datefmt(date, cfg.dateFmt);
                //
                mydate.close();
            };
        });
    };
    let bindEvent_ClearBtn = () => {
        // 点击清空
        M(dateboxDom).find('.date-btn-clear')[0].onclick = (event) => {
            event.stopPropagation();
            // let thisobj = event.currentTarget;
            //
            inputDOM.value = '';
            mydate.close();
        };
    };
    let bindEvent_OkBtn = () => {
        // 点击确定按钮
        M(dateboxDom).find('.date-btn-ok')[0].onclick = (event) => {
            event.stopPropagation();
            let thisobj = event.currentTarget;
            //
            // 找到选中的日 设置到Input框 如果没有选中的日,使用当前设置日期
            let seledDay = M(dateboxDom).find('.date-item-day.selected');
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
        M(document.body).find('.' + dateboxCls).remove();
    };

    // 点击日期控件以外区域,关闭控件. 
    document.onclick = () => {
        mydate.close();
    };
    // 日期函数名
    win.MyDatePick = mydate;
})(window);
/*
必须参数:{
    domId:'容器DOM的id',
    totalData:'总数',
    pageIndex:'当前页码',
    pageSize:'每页数量',
    pageClickE:'页码点击方法'
    }
当总数大于0时,才需要调用分页条
*/
((win) => {
    // 帮助函数
    const M = win.$ui;
    //------------------------------------------------------------------------------------------------//
    // 总页数(由数量总数和分页大小算出)
    let getTotalPage = (dataCount, pageSize, pageIndex) => {
        if (dataCount >= 0 && pageSize >= 5 &&
            pageIndex >= 1) {
            let pagecount = parseInt(dataCount / pageSize);
            let pagecountMod = dataCount % pageSize;
            return pagecountMod > 0 ? pagecount + 1 : pagecount;
        }
        return 0;
    };
    // 配置设定检查,返回配置对象
    let initCfg = (config) => {
        let cfg = {};
        // 当前页码
        cfg.PageIndex = config.pageIndex || 1;
        // 每页数量[5-50]
        cfg.PageSize = (config.pageSize > 4 && config.pageSize < 51) ? config.pageSize : 10;
        // 数据总数
        cfg.TotalData = config.totalData || 0;
        // 总页数
        cfg.TotalPage = getTotalPage(cfg.TotalData, cfg.PageSize, cfg.PageIndex);
        // 分页按钮个数[5-10].
        cfg.TotalBtn = (config.totalBtn > 4 && config.totalBtn < 11) ? config.totalBtn : 5;
        // 页码点击事件方法
        cfg.pageClickE = config.pageClickE;
        return cfg;
    };

    // 计算起始页码位置:以当前页码为中间位置,根据需要显示的页码按钮个数,计算当前页码之前和之后的页码数.
    // 当前页码在正中,如果显示按钮个数为偶数,则偏左.例如: "2 3 (4:当前页码在此) 5 6 7"
    let pagenumRange = (cfg) => {
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
        cfg.StartIndex = startIndex;
        cfg.EndIndex = endIndex;
        //console.log(cfg);
    };


    /*====================*
     * 事件绑定 
     *====================*/
    let bindEventForAllBtn = (pnDom, cfg) => {
        // 页码按钮点击
        M(pnDom).find('.pagenum-prev,.pagenum-next,.pagenum-first,.pagenum-last,.pagenum-num').each((item) => {
            item.onclick = () => {
                // 页码参数范围[1-总页码],范围外不动作
                let pnnum = parseInt(M(item).prop('pagenum')) || 0;
                if (pnnum < 1 || pnnum > cfg.TotalPage) return;
                cfg.pageClickE(pnnum);
            };
        });

        // 确定按钮点击
        M(pnDom).find('.pagenum-ok')[0].onclick = () => {
            let pnnum = parseInt(M(pnDom).find('.pagenum-input')[0].value || 0);
            if (pnnum < 1 || pnnum > cfg.TotalPage) return;
            cfg.pageClickE(pnnum);
        };
    };
    // 生成分页条
    let pageNum = (config) => {
        // 分页条容器DOM对象
        let pnDom = document.getElementById(config.domId);
        // 1. 配置对象
        let cfg = initCfg(config);

        // 2. 更新分页条数据,绑定相关事件,生成新的分页条
        // 清空DOM,重新生成分页组件DOM,绑定事件
        pnDom.innerHTML = '';
        pnDom.innerText = '';
        // 1.页码按钮区域
        let btnsarea = M('<span>').addClass('pagenum-btns')[0];
        // 2.跳转按钮区域
        let btnskip = M('<span>').addClass('pagenum-skip')[0];
        btnskip.innerHTML = `共<b class="pagenum-total">${cfg.TotalPage}</b>页&nbsp;&nbsp;到第<input class="pagenum-input" />页<a class="pagenum-ok">确定</a>`;

        // 计算页码起止
        pagenumRange(cfg);
        //console.log(cfg);
        /*-------------------------------------------------------*
         * 添加按钮DOM
         * 页码区固定按钮4个:前一页,第1页和第末页,后一页.
         *-------------------------------------------------------*/
        let btndom = M.fragment();

        // 向前按钮
        btndom.append(M('<a>').addClass('pagenum-prev').prop('pagenum', cfg.PageIndex - 1).text('〈')[0]);
        // 第1页按钮,当起始页码大于1时添加
        if (cfg.StartIndex > 1) {
            let isactiveNum = cfg.PageIndex == 1 ? 'active' : 'num';
            btndom.append(M('<a>').addClass('pagenum-' + isactiveNum).prop('pagenum', 1).text('1')[0]);
        }

        // 前省略号,当起始页码大于2时添加
        if (cfg.StartIndex > 2) {
            btndom.append(M('<span>').addClass('pagenum-break').text('...')[0]);
        }
        // 页码按钮
        for (let i = cfg.StartIndex; i <= cfg.EndIndex; i++) {
            let pagenum = i;
            let isactiveNum = pagenum == cfg.PageIndex ? 'active' : 'num';
            btndom.append(M('<a>').addClass('pagenum-' + isactiveNum).prop('pagenum', pagenum).text(pagenum)[0]);
        }
        // 后省略号,当结束页小于最大页码-1时
        if (cfg.EndIndex < (cfg.TotalPage - 1)) {
            btndom.append(M('<span>').addClass('pagenum-break').text('...')[0]);
        }
        // 最后页按钮,当结束页小于最大页码时添加
        if (cfg.EndIndex < cfg.TotalPage) {
            let isactiveNum = cfg.PageIndex == cfg.TotalPage ? 'active' : 'num';
            btndom.append(M('<a>').addClass('pagenum-' + isactiveNum).prop('pagenum', cfg.TotalPage).text(cfg.TotalPage)[0]);
        }

        // 向后按钮
        btndom.append(M('<a>').addClass('pagenum-next').prop('pagenum', cfg.PageIndex + 1).text('〉')[0]);

        // 将btndom添加到页码按钮区域容器
        btnsarea.appendChild(btndom);
        pnDom.appendChild(btnsarea);
        pnDom.appendChild(btnskip);
        // 绑定所有按钮事件
        bindEventForAllBtn(pnDom, cfg);
    };
    // window对象名字
    win.pagenum = pageNum;
})(window);
/**
 * 侧边菜单
 */
((win) => {
    // 传入菜单nav标记的id,生成菜单 menuItemClickE(menuItemDom):菜单项点击事件
    let sideMenu = (menuboxId, menuItemClickE) => {
        // 菜单navDom
        let self = {};
        self.menuDom = document.getElementById(menuboxId);
        bindEvent_menuGroup(self.menuDom);
        bindEvent_menuItem(self.menuDom, menuItemClickE);
        // 程序操作点击菜单
        self.activeItem = (menuIndex) => {
            let activeMenuItem = self.menuDom.querySelectorAll('.sidemenu-item')[menuIndex];
            activeMenuItem.click();
        }
        return self;
    };
    // 菜单组收起和展开
    let bindEvent_menuGroup = (menuDom) => {
        let showClsN = 'sidemenu-arrdown',
            hideClsN = 'sidemenu-arrleft';
        menuDom.querySelectorAll('.sidemenu-label').forEach((item) => {
            item.onclick = () => {
                let arrowDom = item.parentNode.querySelector(`.${showClsN},.${hideClsN}`);
                if (arrowDom.classList.contains(showClsN)) {
                    arrowDom.classList.remove(showClsN);
                    arrowDom.classList.add(hideClsN);
                    // 找到ul
                    item.parentNode.parentNode.classList.add('sidemenu-group-close');
                } else {
                    arrowDom.classList.add(showClsN);
                    arrowDom.classList.remove(hideClsN);
                    item.parentNode.parentNode.classList.remove('sidemenu-group-close');
                }
            }
        });
    };
    // 菜单项点击
    let bindEvent_menuItem = (menuDom, menuItemClickE) => {
        let clsN = 'active';
        menuDom.querySelectorAll('.sidemenu-item').forEach((item) => {
            item.onclick = () => {
                menuDom.querySelectorAll('.sidemenu-item.active').forEach((item) => {
                    item.classList.remove(clsN);
                });
                item.classList.add(clsN);
                if (typeof menuItemClickE == 'function')
                    menuItemClickE(item);
            }
        });
    };
    // window上的引用名字
    win.sidemenu = sideMenu;
})(window);
// 选项卡页插件
((win) => {
    // 激活时样式名
    const activeCls = 'active';
    // 标题样式名
    const tabLabelCls = 'tabs-label';
    // 面板样式名
    const tabPanelCls = 'tabs-panel';
    // 标题与面板关联属性名
    const relkey = 'pid';
    // 帮助函数
    const M = win.$ui;
    /**
     * 生成一个新的pid
     * @param {Array} pids 现有的pid数组,不能与已有的pid重复
     * @returns {number} 返回新的pid值
     */
    let newPid = (pids) => {
        let newpid = pids.length;
        while (pids.indexOf(newpid) > 0) {
            newpid++;
        }
        return newpid;
    };
    /**
     * 切换激活选项卡
     * @param {any} self tabs对象
     * @param {number|HTMLElement} activeTab 要激活的选项卡索引或者对象.如果索引无效或者超过选项卡个数,则激活第0个.
     */
    let _activeTab = (self, activeTab) => {
        // 要切换到这个选项卡
        let labelNow = activeTab;
        if (!activeTab)
            labelNow = self.tabsLabels[0];
        if (typeof activeTab === 'number') {
            if (activeTab >= self.tabsLabels.length)
                labelNow = self.tabsLabels[0];
            else
                labelNow = self.tabsLabels[activeTab];
        }
        // console.log(labelNow);
        // 去掉其它选项卡激活状态,将当前选项卡置为活动
        // 隐藏其它面板,激活对应面板.选项卡与面板由pid属性关联.选项卡标签pid值与面板pid值相等
        let pidOld = M(self.tabsDom).find('.' + activeCls).removeClass(activeCls).prop(relkey);
        M(self.tabsDom).find(`.${tabPanelCls}[${relkey}='${pidOld}']`).removeClass(activeCls);
        //
        let pidNow = M(labelNow).addClass(activeCls).prop(relkey);
        M(self.tabsDom).find(`.${tabPanelCls}[${relkey}='${pidNow}']`).addClass(activeCls);

        // 执行激活后方法
        if (typeof self.onTabActive === 'function')
            self.onTabActive(labelNow);
    };
    /**
     * 绑定选项卡标签切换事件.每个选项卡标签单独绑定
     * @param {any} self tabs对象
     * @param {any} tabLabel tablabel对象
     */
    let bindEvent_onChange = (self, tabLabel) => {
        if (self.changeType == 2) {
            tabLabel.onmouseenter = () => {
                _activeTab(self, tabLabel);
            };
        } else {
            tabLabel.onclick = () => {
                _activeTab(self, tabLabel);
            };
        }
    };
    /**
     * 增加一个选项卡
     * @param {any} self tabs对象
     * @param {string} title 选项卡标题
     * @param {number} index 添加到这个索引位置,原有位置的选项卡后移.如果索引无效,加到最后.
     * @returns {number} 新面板id值
     */
    let _addTab = (self, title, index) => {
        let count = self.getCount();
        let addIndex = index;
        if (!addIndex || addIndex < 0 || addIndex >= count)
            addIndex = count;
        // 生成pid
        let pid = newPid(self.tabsLabelsPids);
        self.tabsLabelsPids.push(pid);
        // 生成选项卡标签和面板.
        let label = M('<span>').addClass(tabLabelCls).text(title).prop(relkey, pid)[0];
        //
        let panel = M('<div>').addClass(tabPanelCls).prop(relkey, pid)[0];
        // 绑定标签的点击事件
        bindEvent_onChange(self, label);
        // 标签加入
        if (addIndex == count) {
            M(self.tabsLabels[self.tabsLabels.length-1]).after(label);
        } else {
            // 如果是插入添加,原有位置的标签后移
            M(self.tabsLabels[addIndex]).before(label);
        }
        // 面板加入
        M(self.tabsDom).append(panel);
        return pid;
    };
    /**
     * 删除一个选项卡pid
     * @param {any} self tabs对象
     * @param {number} index 要删除的选项卡索引或者pid
     * @param {string} tagType index=索引(默认) | pid=pid
     */
    let _delTab = (self, index, tagType) => {
        if (tagType === 'pid') {
            // pid有效时做删除
            if (self.tabsLabelsPids.contains(index)) {
                let panel = M(self.tabsDom).find(`.${tabPanelCls}[${relkey}='${index}']`).remove();
                let label = M(self.tabsDom).find(`.${tabLabelCls}[${relkey}='${index}']`).remove();
                // pids列表更新
                let pidIndex = self.tabsLabelsPids.indexOf(index);
                self.tabsLabelsPids.splice(pidIndex, 1);
            }
        } else {
            // index有效时做删除
            if (!index || index < 0 || index >= self.tabsLabels.length)
                return;
            let label = self.tabsLabels[index];
            let pid = M(label).prop(relkey);
            M(label).remove();
            let panel = M(self.tabsDom).find(`.${tabPanelCls}[${relkey}='${pid}']`).remove();
            // pids列表更新
            let pidIndex = self.tabsLabelsPids.indexOf(parseInt(pid));
            self.tabsLabelsPids.splice(pidIndex, 1);
        }
    };
    //--------------------------------------------------------------------------//
    /**
     * 初始化选项卡(工厂函数)
     * @param {string|HTMLElement} tabsId 容器DomId,或者dom对象
     * @param {number} activeIndex 默认活动页索引 0
     * @param {number} changeType 切换方式:1=点击(默认) 2=鼠标移入
     * @returns {any} 选项卡对象
     */
    let tabs = (tabsId, activeIndex, changeType) => {
        // 选项卡对象
        let self = {};

        /**** Prop ****/
        // event:激活某个选项卡后执行方法 
        self.onTabActive = null;
        // 切换方式
        self.changeType = changeType || 1;

        // 选项卡容器DOM对象
        self.tabsDom = typeof tabsId === 'string' ? document.getElementById(tabsId) : tabsId;
        // 选项卡所有标签dom列表
        // (*注意)这里要用getElementsByClassName(),这个方法取得的dom列表, 会随着选项卡dom的加减而自动刷新(动态的),而querySelectorAll()取得的列表不会(静态的).)
        self.tabsLabels = self.tabsDom.getElementsByClassName(tabLabelCls);
        // 选项卡pid数组
        self.tabsLabelsPids = [];

        /**** Init ****/
        // 设置每个标签的pid属性
        for (let i = 0; i < self.tabsLabels.length; i++) {
            let pid = newPid(self.tabsLabelsPids);
            M(self.tabsLabels[i]).prop(relkey, pid);
            self.tabsLabelsPids.push(pid);
        }
        // 设置每个面板的pid属性
        let panels = self.tabsDom.getElementsByClassName(tabPanelCls);
        for (let i = 0; i < self.tabsLabelsPids.length; i++) {
            let pid = self.tabsLabelsPids[i];
            if (i >= panels.length) break;
            M(panels[i]).prop(relkey, pid);
        }
        // 给默认激活的选项卡标签,设置活动样式.如果传入的索引超过选项卡个数,忽略
        let _index = activeIndex;
        if (!activeIndex || activeIndex < 0 || activeIndex >= self.tabsLabels.length)
            _index = 0;
        M(self.tabsLabels[_index]).addClass(activeCls);
        if (_index < panels.length)
            M(panels[_index]).addClass(activeCls);

        /**** Method ****/
        // 切换选项卡方法 index: 要激活的选项卡索引
        self.activeTab = (index) => {
            _activeTab(self, index);
        };
        // 删除一个选项卡. index:要删除的选项卡索引.tagType:'index'(默认) | 'pid'
        self.delTab = (index, tagType) => {
            _delTab(self, index, tagType);
        };
        // 添加一个选项卡. title:选项卡标题, index:添加到这个索引位置
        self.addTab = (title, index) => {
            _addTab(self, title, index);
        };
        // 返回选项卡个数
        self.getCount = () => {
            return self.tabsLabels.length;
        };

        /**** Event ****/
        // 绑定选项卡标签的切换事件
        for (var i = 0; i < self.tabsLabels.length; i++) {
            let item = self.tabsLabels[i];
            bindEvent_onChange(self, item);
        }

        //
        return self;
    };
    // window引用名
    win.tabs = tabs;
})(window);