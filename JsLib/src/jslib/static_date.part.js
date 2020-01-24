// ==================================
//           时间相关方法
// ==================================
/**
 * 格式化时间,
 * @param {Date} date 要格式化的Date对象
 * @param {string} fmtstr format string 格式化字符串 (默认:四位年份,24小时制: "yyyy/MM/dd HH:mm:ss").
 * 自定义格式时,年月日时分秒代号必须是: y(年)M(月)d(日)H(时)m(分)s(秒)
 * @returns {string} 返回格式化时间字符串
 */
factory.datefmt = (date, fmtstr) => {
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