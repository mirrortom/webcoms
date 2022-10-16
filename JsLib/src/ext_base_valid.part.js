// ==================================
//           验证相关方法
// ==================================
/**
 * 指示一个字符串是否含有内容,并且不能全部是空白字符
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isNotNull = (str) => {
    return !factory.isNullOrWhiteSpace(str);
};
/**
 * 指示一个字符串是否为数值
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isNumber = (str) => {
    if (!str || str.length === 0) return true;
    return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(str);
};
/**
 * 指示一个字符串是否为email地址
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isEmail = (str) => {
    if (!str || str.length === 0) return true;
    return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(str);
};
/**
 * 指示一个字符串是否为国内11位手机号
 * [可匹配"(+86)013800138000",()号可以省略，+号可以省略，(+86)可以省略,11位手机号前的0可以省略;11位手机号第二位数可以是3~9中的任意一个]
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isMobile = (str) => {
    if (!str || str.length === 0) return true;
    return /^(\((\+)?86\)|((\+)?86)?)0?1[^012]\d{9}$/.test(str);
};
/**
 * 指示一个字符串是否为26个英文字母组成,大小写不限.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isAbc = (str) => {
    if (!str || str.length === 0) return true;
    return !/[^a-zA-Z]/.test(str);
};
/**
 * 指示一个字符串是否为0-9整数组成
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isDigit = (str) => {
    if (!str || str.length === 0) return true;
    return /^\d+$/.test(str);
};
/**
 * 指示一个字符串是否为26个英文字母和0-9整数(可选)组成,但必须是字母开头.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isAbcDigit = (str) => {
    if (!str || str.length === 0) return true;
    return /^[a-zA-Z][a-zA-Z\d]*$/.test(str);
};
/**
 * 指示一个字符串是否为26个英文字母和0-9整数(可选)和_下划线(可选)组成,并且是字母或者下划线开头.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isAbcDigitUline = (str) => {
    if (!str || str.length === 0) return true;
    return /^[a-zA-Z_][a-zA-Z\d_]*$/.test(str);
};
/**
 * 指示一个字符串是否为url
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isUrl = (str) => {
    if (!str || str.length === 0) return true;
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str);
};
/**
 * 指示一个字符串是否为ipv4
 * @param {any} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isIpv4 = (str) => {
    if (!str || str.length === 0) return true;
    return /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(str);
};
/**
 * 指示一个字符串长度是否超过maxlength.
 * @param {string} str 被检查字符串
 * @param {int} maxlen 最大长度
 * @returns {boolean} t/f
 */
factory.isMaxLength = (str, maxlen) => {
    if (!str || str.length === 0) return false;
    if (isNaN(parseInt(maxlen))) return false;
    return str.length > parseInt(maxlen);
};
/**
 * 指示一个字符串长度是否小于minlength
 * @param {string} str 被检查字符串
 * @param {int} minlen 最小长度
 * @returns {boolean} t/f
 */
factory.isMinLength = (str, minlen) => {
    if (!str || str.length === 0) return false;
    if (isNaN(parseInt(minlen))) return false;
    return str.length < parseInt(minlen);
};
/**
 * 指示一个数值是否小于minnum
 * @param {any} str
 * @param {any} minnum
 */
factory.isMinNum = (str, minnum) => {
    let n = parseFloat(str);
    if (isNaN(n)) return false;
    // 对于'3s'这种字符串,parseFloat也成功,这里也不考虑比较
    if (n != str) return false;
    if (isNaN(parseFloat(minnum))) return false;
    return n < minnum;
};
/**
 * 指示一个数值是否大于minnum
 * @param {any} str
 * @param {any} maxnum
 */
factory.isMaxNum = (str, maxnum) => {
    let n = parseFloat(str);
    if (isNaN(n)) return false;
    // 对于'3s'这种字符串,parseFloat也成功,这里也不考虑比较
    if (n != str) return false;
    if (isNaN(parseFloat(maxnum))) return false;
    return n > maxnum;
};
/**
 * 指示一个字符串是否为1~3位小数,或者正数 (d | d.dd | d.d | d.ddd),可用于金额
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isMoney = (str) => {
    if (!str || str.length === 0) return true;
    return /^-?[0-9]+([.]{1}[0-9]{1,3})?$/.test(str);
};
/**
 * 指示一个字符串是否为日期格式
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isDate = (str) => {
    if (!str || str.length === 0) return true;
    return !/Invalid|NaN/.test(new Date(str).toString());
};