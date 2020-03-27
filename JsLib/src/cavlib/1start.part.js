//================================================================================//
// canvas画图工具,包含简单的直线,曲线,图标绘画等
// window上的对象"cavlib"
//=================================================================================//
// 
((win) => {
    "use strict";
    /**
     * 获取canvalib库的操作对象,包含当前操作的canvas元素属性"this.canvas",和2d对象"this.ctx",和库提供的工具方法
     * @param {string} canvasId canvasDom的id
     * @returns {any} 返回this
     */
    function canvalib(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas)
            throw new Error('canvasId not found');
        //
        this.ctx = this.canvas.getContext('2d');
        //
        return this;
    }
    /**
     * 画布元素.给canva元素设置style
     * @param {number} num 风格代码 0,1,..0(博客用的风格)
     * @returns {any} 返回this
     */
    canvalib.prototype.style = function (num = 0) {
        if (num == 0) {
            this.canvas.style.display = 'block';
            //this.canv.style.margin = 'auto';
            this.canvas.style.backgroundColor = '#f0f0f0';
        }
        return this;
    }
    //================================================================================//
    // 工厂函数factory,返回canvalib对象
    // 其它静态方法都绑定在factory上
    //================================================================================//
    let factory = (canvasId) => {
        return new canvalib(canvasId);
    };
    /**
     * 为canvalib对象添加实例方法 prototype
     * @param {any} json 一个方法名和函数值的json对像.方法名要用""号包起来.
     */
    factory.extend = (json) => {
        for (var name in json) {
            canvalib.prototype[name] = json[name];
        }
    };