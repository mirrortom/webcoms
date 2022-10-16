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