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
// 实例方法
factory.extend({
    /**
     * 带箭头的线,从points的第1组坐标开始到最后一组坐标,结束时画上箭头.箭头底边与线段最后一段垂直
     * points:[p1x,p1y,p2x,p2y....],side:箭头底边,height:箭头高,fill=true(实心)false(空心)
     * @param {Array<number>} points x1,y1,x2,y2,....
     * @param {number} side 箭头底边长
     * @param {number} height 箭头高
     * @param {boolean} fill true(实心)false(空心)
     * @returns {any} return this
     */
    'lineArrow': function (points, side = 12, height = 10, fill = true) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(points[0], points[1]);
        for (var i = 2, len = points.length; i < len; i += 2) {
            this.ctx.lineTo(points[i], points[i + 1]);
        }
        this.ctx.stroke();
        // 箭头的底边与线条最后一段垂直
        let endP = { x: points[points.length - 2], y: points[points.length - 1] };
        let lastP = { x: points[points.length - 4], y: points[points.length - 3] };
        // 调整画布坐标状态到合适的位置,以使用统一的方法画箭头.(统一使用X轴正方向画箭头)
        let topAngerX = 0;
        if (endP.x == lastP.x) {
            // 垂直线情况
            this.ctx.translate(endP.x, endP.y);
            this.ctx.rotate(Math.PI / 2);
            this.ctx.beginPath();
            topAngerX = endP.y > lastP.y ? height : -height;
        } else {
            let k = (endP.y - lastP.y) / (lastP.x - endP.x);
            this.ctx.translate(endP.x, endP.y);
            this.ctx.rotate(-Math.atan(k))
            topAngerX = endP.x > lastP.x ? height : -height;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(0, -side / 2);
        this.ctx.lineTo(0, side / 2);
        this.ctx.lineTo(topAngerX, 0);
        this.ctx.closePath();
        if (fill == true) {
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
        this.ctx.restore();
        return this;
    }
});

// window上的引用名 "cavlib"或者"cl",外部使用
win.cavlib = factory;
if (!win.cl)
    win.cl = factory;
}) (window);