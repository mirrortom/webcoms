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