/**圆相关计算 */
let cirs = {};
/**
 * 获取两个圆的切点坐标.如果相切,返回切点坐标,如果相交,返回公共弦与圆心连线交点坐标.
 * @param {{x:number,y:number,r:number}} cir1 圆1
 * @param {{x:number,y:number,r:number}} cir2 圆2
 * @returns {{x:number,y:number,istag:boolean}} istag:相切时为true,其它为false 没有切点或者交点,返回null.
 */
cirs.getTangent = (cir1, cir2) => {
    let r1 = cir1, r2 = cir2;
    // 圆心连线长度
    let m = Math.sqrt((r1.x - r2.x) * (r1.x - r2.x) + (r1.y - r2.y) * (r1.y - r2.y));
    
    // 相离 ,重叠, 相容 时,没有切点
    // 两个圆相交当且仅当两个圆心之间的距离严格小于两圆的半径之和,并严格大于两圆的半径之差
    if (m > r1.r + r2.r || m < Math.abs(r1.r - r2.r))
        return null;

    // 圆心连线与公共弦交点到r1圆心的距离,如果两个圆相切,那么这个交点就是切点
    let x = (r1.r * r1.r - r2.r * r2.r + m * m) / (2 * m);
    // 连线与公共弦交点坐标 (定比分点公式求出)
    let od = { x: 0, y: 0, istag: false }, p = x / (m - x);
    od.x = (r1.x + p * r2.x) / (1 + p);
    od.y = (r1.y + p * r2.y) / (1 + p);
    // 1位小数误差范围
    od.istag = parseFloat(m.toFixed(1)) == r1.r + r2.r || parseFloat(m.toFixed(1)) == Math.abs(r1.r - r2.r);

    return od;
};
/**
 * 获取两个圆的交点坐标
 * @param {{x:number,y:number,r:number}} cir1 圆1
 * @param {{x:number,y:number,r:number}} cir2 圆2
 * @returns {{x1:number,y1:number,x2:number,y2:number}} 没有交点返回null
 */
cirs.getCrossLine = (cir1, cir2) => {
    let r1 = cir1, r2 = cir2;
    // 圆心连线长度
    let m = Math.sqrt((r1.x - r2.x) * (r1.x - r2.x) + (r1.y - r2.y) * (r1.y - r2.y));

    // 1. 相离 ,重叠, 相容 时,没有交点(不相交)
    // 两个圆相交当且仅当两个圆心之间的距离严格小于两圆的半径之和,并严格大于两圆的半径之差
    if (m > r1.r + r2.r || m < Math.abs(r1.r - r2.r))
        return null;

    // 公式计算出的坐标值,其参照坐标系是以圆心连线为 X 轴,并且以 r1 的圆心为原点的.(r1 是圆心坐标的 x 值较小的那个圆.)
    // 所以,坐标值要经过旋转和平移变换计算,得到原坐标系中的坐标值
    // 旋转变换角度,是圆心连线斜率对应角度,如果是y轴平行线,角度为-90度. 平移变换,以 r1 圆心坐标为平移点,

    // 比较两个圆心的 X 值,以较小者为r1
    if (cir1.x > cir2.x)
        r1 = cir2, r2 = cir1;
    // 如果连线垂直, Y 值小的为r1
    if (cir1.x == cir2.x && cir1.y > cir2.y)
        r1 = cir2, r2 = cir1;

    // 圆心连线和公共弦交点到圆心1的距离
    let x = (r1.r * r1.r - r2.r * r2.r + m * m) / (2 * m);

    // 公共弦长度/2
    let y = Math.sqrt(r1.r * r1.r - x * x);

    // 交点坐标
    let x1 = x, y1 = y, x2 = x, y2 = -y;

    // 变换到原来的坐标
    let x0 = x1, y0 = y1;

    // 1.旋转
    // 圆心连线斜率
    let k = cavlib.line.getK({ x: r1.x, y: -r1.y }, { x: r2.x, y: -r2.y });
    // 对应角度
    let angle = k == null ? -Math.PI / 2 : Math.atan(k);
    // Math.cos(Math.PI / 2)的值应该为0, 但是JS的精度问题, 其值是个非常接近0的数 6.123233995736766e-17
    let cK = Math.cos(angle), sK = Math.sin(angle);
    // 
    x1 = x0 * cK + y0 * sK;
    y1 = y0 * cK - x0 * sK;
    x0 = x2, y0 = y2;
    x2 = x0 * cK + y0 * sK;
    y2 = y0 * cK - x0 * sK;
    // 2.平移
    x0 = x1, y0 = y1;
    x1 = x0 + r1.x, y1 = y0 + r1.y;
    x0 = x2, y0 = y2;
    x2 = x0 + r1.x, y2 = y0 + r1.y;
    return {
        x1: parseFloat(x1.toFixed(4)), y1: parseFloat(y1.toFixed(4))
        , x2: parseFloat(x2.toFixed(4)), y2: parseFloat(y2.toFixed(4))
    };
};
// 
factory.cirs = cirs;