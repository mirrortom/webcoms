// ==================================
//           字符串相关方法
// ==================================
/**
 * 字符串是否为空或者null.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isEmptyOrNull = (str) => {
    return !str || str.length === 0;
};
/**
 * 字符串是否为空或者null或者全是空白字符.
 * @param {string} str 被检查字符串
 * @returns {boolean} t/f
 */
factory.isNullOrWhiteSpace = (str) => {
    if (/^\s+$/.test(str)) return true; // 全部是空白字符
    return !str || str.length === 0;
};
/**
 * 格式化字符串,将字符串中的占位符替换为给定字符串{d},返回替换后字符串.例:("my name is {0} from {1}",mirror,china)
 * @param {string} str 要格式化的字符串,包含占位符{d}
 * @param {...any} repstrs 替换占位符的字符串数组
 * @returns {string} 返回替换后字符串
 */
factory.format = (str, ...repstrs) => {
    // 替换函数的参数m表示匹配到的字串,j表示正则中圆括号捕获的值(就是占位数字).用这数字当下标到填充值数组取值,作为替换串返回
    return str.replace(/\{(\d+)\}/g, function (m, j) { return repstrs[j]; });
};
/**
 * 格式化字符串,根据占位符${key},到json中找到json.key,然后替换掉${key}
 * @param {string} str 要格式化的字符串,包含占位符${key}
 * @param {any} json json对象,键为key
 * @returns {string} 返回替换后字符串
 */
factory.dataBind = (str, json) => {
    
    // 根据指定的key,到data中取值,然后替换掉${key}
    // 其中m表示找到的'${key}', key表示圆括号中的值(属性名)
    // 没找到的'${key}'时, ${key}替换为''(空值)
    return str.replace(/\${(.+?)\}/g, function (m, key) { return json.hasOwnProperty(key) ? json[key] : ''; });
};
/**
 * 去除字符串前后的空白字符
 * @param {string} str 字符串
 * @returns {string} 返回新字符串
 */
factory.trim = (str) => {
    return str.replace(/^\s*|\s*$/g, '');
};