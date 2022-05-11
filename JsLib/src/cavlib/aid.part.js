// ====
// 辅助方法,比如画坐标系箭头辅助线等等.
// 实例方法
// ====
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

factory.extend({
    /**
     * 画坐标轴辅助线:以画布中心为原点,箭头方向:,X轴右方向,Y轴上方向
     * 
     * @param {number} style 风格: 虚线=0,实线=1
     * @param {number} oX 原点x坐标
     * @param {number} oY 原点y坐标
     * @param {number} oXLen x轴长度
     * @param {number} oYLen y轴长度
     * @returns {any} return this
     */
    'xyAxis': function (style = 0, oX = null, oY = null, oXLen = 0, oYLen = 0) {
        let x = oX || this.canvas.width / 2;
        let y = oY || this.canvas.height / 2;
        let xLen = oXLen || this.canvas.width;
        let yLen = oYLen || this.canvas.height;
        //
        this.ctx.save();
        this.ctx.translate(x, y);
        // 线条风格
        if (style == 0) {
            this.ctx.setLineDash([2]);
        }
        // x,y轴
        this.ctx.beginPath();
        this.lineArrow([-x, 0, x - 10, 0]);
        this.lineArrow([0, y, 0, -y + 10]);
        this.ctx.restore();
        return this;
    }
});