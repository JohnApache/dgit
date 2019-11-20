"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const request_1 = tslib_1.__importDefault(require("request"));
const requestGet = (options, maxRetryCount, hooks) => {
    const { onSuccess, onError, onFinish, onRetry, } = hooks || {};
    request_1.default.get(options, (err, _, body) => {
        if (err) {
            if (maxRetryCount < 1) {
                onError && onError(err);
                onFinish && onFinish();
                return;
            }
            onRetry && onRetry();
            requestGet(options, maxRetryCount - 1, hooks);
            return;
        }
        onSuccess && onSuccess(body);
        onFinish && onFinish();
    });
};
exports.requestGetPromise = (options, dgitOptions, hooks) => new Promise((resolve, reject) => {
    const { maxRetryCount = 5, } = dgitOptions;
    const { onSuccess, onError, onFinish, onRetry, } = hooks || {};
    const newHooks = {
        onSuccess(data) {
            resolve(data);
            onSuccess && onSuccess(data);
        },
        onError(err) {
            reject(err);
            onError && onError(err);
        },
        onFinish,
        onRetry,
    };
    requestGet(options, maxRetryCount, newHooks);
});
exports.requestOnStream = (url, ws, dgitOptions, hooks) => {
    const { maxRetryCount = 5, } = dgitOptions;
    const { onSuccess, onError, onFinish, onRetry, } = hooks || {};
    const fn = (retryCount) => {
        request_1.default(encodeURI(url))
            .on('error', (err) => {
            if (retryCount <= 0) {
                onError && onError(err);
                return;
            }
            onRetry && onRetry();
            fn(retryCount - 1);
        })
            .on('close', () => {
            onFinish && onFinish();
        })
            .pipe(ws);
        ws.on('finish', () => {
            onSuccess && onSuccess();
        });
    };
    fn(maxRetryCount);
};
