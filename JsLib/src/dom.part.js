// 实例方法
factory.extend({
    /**
     * 以已经匹配的元素为根,查找子元素.(原生: dom.querySelectorAll())
     * @param {string} selector css选择器.如果选择器错误,会报异常.
     * @returns {jslib} 返回this
     */
    "find": function (selector) {
        let tmplist = [];
        this.each((item) => {
            let nodelist = item.querySelectorAll(selector);
            nodelist.forEach((finditem) => {
                tmplist.push(finditem);
            });
        });
        // 重置已选元素
        this.empty();
        tmplist.forEach((item) => {
            this.push(item);
        });
        return this;
    },
    /**
     * 筛选取匹配元素的第n个元素(模拟jquery的eq()筛选方法)
     * @param {number} index 下标
     * @returns {jslib} 返回this
     */
    "eq": function (index) {
        this[0] = this[index];
        Array.prototype.splice.call(this, 1);
        return this;
    },
    /**
     * 设置每个匹配元素的属性或返回第一个元素的属性值.(原生: getAttribute(),setAttribute())
     * @param {string|object} key 属性名或属性名~值对的json对象
     * @param {string} val 属性值
     * @returns {jslib} 取属性时返回属性值.否则返回this
     */
    "prop": function (key, val) {
        if (typeof key === 'string') {
            // 获取第0个
            if (val === undefined) {
                if (!this[0]) return;
                return this[0].getAttribute(key);
            }
            // 设置单个
            this.each((dom) => {
                if (this[0]);
                dom.setAttribute(key, val);
            });
        } else if (typeof key === 'object') {
            // 设置多个
            this.each((dom) => {
                for (var k in key) {
                    dom.setAttribute(k, key[k]);
                }
            });
        }
        return this;
    },
    /**
     * 删除每个匹配的元素指定的属性
     * @param {string[]} key 属性名,一个或多个
     * @returns {jslib} return this
     */
    "removeProp": function (...key) {
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
    "addClass": function (...val) {
        this.each((item) => {
            item.classList.add(...val);
        });
        return this;
    },
    /**
     * 从所有匹配的元素中删除全部或者指定的类.(原生: classList.remove())
     * @param {string[]} val 样式类名字,不定个数参数.如果不传,删除所有样式
     * @returns {jslib} 返回this
     */
    "removeClass": function (...val) {
        if (val.length === 0) {
            this.each((item) => {
                item.setAttribute('class', '');
            });
        }
        this.each((item) => {
            item.classList.remove(...val);
        });
        return this;
    },
    /**
     * 设置所有匹配的元素的innerTEXT.无参数时,返回第一个元素的innerText内容(原生: innerText)
     * @param {string} val 设置的文本
     * @returns {jslib} 取值时返回值.否则返回this
     */
    "text": function (val) {
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
     * 设置所有匹配的元素的innerHTML.无参数时,返回第一个元素的innerHTML内容(原生: innerHTML)
     * @param {string} val 设置的html标记
     * @returns {jslib} 取值时返回值.否则返回this
     */
    "html": function (val) {
        if (val === undefined) {
            if (!this[0]) return;
            return this[0].innerHTML;
        }
        this.each((dom) => {
            dom.innerHTML = val;
        });
        return this;
    },
    /**
     * 向每个匹配元素内部追加内容(原生: append())
     * @param {any[]} content node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    "append": function (...content) {
        this.each((dom) => {
            dom.append(...content);
        });
        return this;
    },
    /**
     * 向每个匹配元素内部第一个子节点前面加入内容(原生: prepend())
     * @param {any[]} content node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    "prepend": function (...content) {
        this.each((dom) => {
            dom.prepend(...content);
        });
        return this;
    },
    /**
     * 向每个匹配元素的前面加一个元素(原生: insertBefore())
     * @param {any[]} content node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    "before": function (...content) {
        this.each((dom) => {
            dom.parentNode.insertBefore(factory.fragment(...content), dom);
        });
        return this;
    },
    /**
     * 向每个匹配元素的后面加一个元素(原生: insertBefore())
     * @param {any[]} content node节点 | DOMString对象 | DocumentFragment对象
     * @returns {jslib} 返回this
     */
    "after": function (...content) {
        this.each((dom) => {
            dom.parentNode.insertBefore(factory.fragment(...content), dom.nextSibling);
        });
        return this;
    },
    /**
     * 删除所有匹配的元素(原生: parentNode.removeChild())
     */
    "remove": function () {
        this.each((dom) => {
            dom.parentNode.removeChild(dom);
        });
        this.empty();
    }
});