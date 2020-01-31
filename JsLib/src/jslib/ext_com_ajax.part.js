// ====================================================================
// ajax (原生: fetch())
// fetch方法返回Promise对象.
// https://github.com/matthew-andrews/isomorphic-fetch
// (详细讲解)https://www.cnblogs.com/libin-1/p/6853677.html
// ====================================================================
((win) => {
    let $ = win.lib;
    /**
     * 简易post方式Ajax, 默认返回json对象
     * @param {string} url 请求url
     * @param {any|FormData} data json对象或者FormData对象,如果是json对象,会转化成FormData对象
     * @param {Function} callback 互调函数
     * @param {string} restype 返回值类型,默认'json',可选'html'
     */
    $.post = (url, data, callback, restype) => {
        let formData = new FormData();
        if (data instanceof FormData) {
            formData = data;
        } else {
            Object.keys(data).forEach((key) => {
                formData.append(key, data[key]);
            });
        }
        //
        let res = fetch(url, { method: "POST", body: formData });
        if (restype === 'html') {
            res.then(response => response.text())
                .then((html) => {
                    callback(html);
                });
        } else {
            res.then(response => response.json())
                .then((json) => {
                    callback(json);
                });
        }
    };
    /**
     * 简易 get方式Ajax, 默认返回html文本
     * @param {string} url 请求url
     * @param {Function} callback 互调函数
     * @param {string} restype 返回值类型,默认'html',可选'json'
     */
    $.get = (url, callback, restype) => {
        let res = fetch(url);
        if (restype === 'json') {
            res.then(response => response.json())
                .then((json) => {
                    callback(json);
                });
        } else {
            res.then(response => response.text())
                .then((html) => {
                    callback(html);
                });
        }
    };
})(window);