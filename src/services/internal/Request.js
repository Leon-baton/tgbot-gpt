const axios = require("axios");

module.exports = async function doRequest(options) {
    if(options.body !== undefined && options.method === undefined) {
        options.method = 'POST'
    }

    return axios({
        baseURL: options.endpoint,
        url: options.path,
        headers: options.headers,
        params: options.query,
        method: options.method,
        data: options.body,
        responseType: options.responseType || 'json',
        timeout: options.timeout === -1 ? undefined : 15000,
        withCredentials: true
    }).then((rsp) => {
        return rsp.data;
    })
}
