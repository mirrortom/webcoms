/**直线相关计算 */
let line = {};
/**
 * 获取两个点所在直线的斜率.如果与 X 轴平行,返回 0 ,与 Y 轴平行返回 null
 * @param {{x:number,y:number}} p1 点1
 * @param {{x:number,y:number}} p2 点2
 * @returns {number} 返回斜率(弧度)
 */
line.getK = (p1, p2) => {
    let y = p2.y - p1.y, x = p2.x - p1.x;
    // 水平线时
    if (y == 0) {
        return 0;
    }
    // 垂直线时
    if (x == 0) {
        return null;
    }
    return y / x;
};
// 
factory.line = line;