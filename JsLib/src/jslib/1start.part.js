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
     * js自定义封装库的定义函数.(下述都称为jslib类数组对象)
     * @param {string|HTMLElement} selector 选择器或者dom对象或/^<[a-z]+?>$/,如'<div>'.表示新建元素.
     * @returns {jslib} 返回this
     */
    function jslib(selector) {
        // 选择器
        if (typeof selector === 'string') {
            if (selector.indexOf('#') === 0) {
                // #id
                this.push(document.getElementById(selector.substr(1)));
            }
            else if (selector.indexOf('.') === 0) {
                // .class
                let nodelist = document.getElementsByClassName(selector.substr(1));
                nodelist.forEach((item) => {
                    this.push(item);
                });
            }
            else if (/^<[a-z]+?>$/.test(selector)) {
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
     * 清空jslib类数组
     * @returns {jslib} 返回this
     */
    jslib.prototype.reset = function () {
        Array.prototype.splice.call(this, 0);
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
        for (var i = 0, len = content.length; i < len; i++) {
            fragm.append(content[i]);
        }
        return fragm;
    };
