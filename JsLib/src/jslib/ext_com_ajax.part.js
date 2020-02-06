// ====================================================================
// ajax (原生: fetch())
// fetch方法返回Promise对象.
// https://github.com/matthew-andrews/isomorphic-fetch
// (详细讲解)https://www.cnblogs.com/libin-1/p/6853677.html
// ====================================================================
((win) => {
    let $ = win.lib;
    /**
     * 简易post方式Ajax,只对参数做了包装. 调用fetch()方法,外部可以继续使用then(),catch().
     * @param {string} url 请求url
     * @param {any|FormData} data json对象或者FormData对象,如果是json对象,会转化成FormData对象
     * @returns {Promise} fetch()方法返回的Promise对象
     */
    $.post = (url, data) => {
        let formData = new FormData();
        if (data instanceof FormData) {
            formData = data;
        } else {
            Object.keys(data).forEach((key) => {
                formData.append(key, data[key]);
            });
        }
        //
        return fetch(url, { method: "POST", body: formData });
    };
    /**
     * 简易 get方式Ajax,只对参数做了包装.调用fetch()方法,外部可以继续使用then(),catch().
     * @param {string} url 请求url
     * @param {Function} para data json对象或者FormData对象,转化为url参数
     * @returns {Promise} fetch()方法返回的Promise对象
     */
    $.get = (url, para) => {
        let urlpara = [];
        if (para) {
            if (para instanceof FormData) {
                para.forEach((val, key) => {
                    urlpara.push(`${key}=${val}`);
                });
            } else {
                Object.keys(para).forEach((key) => {
                    urlpara.push(`${key}=${para[key]}`);
                });
            }
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += urlpara.join('&');
        }
        let eurl = encodeURI(url);
        return fetch(eurl);
    };
})(window);