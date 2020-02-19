"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("./cmd/utils");
const log_1 = require("./log");
const request_1 = tslib_1.__importDefault(require("request"));
const REQUEST_RETRY_DELAY = 1500;
const DEFAULT_MAX_RETRY_COUNT = 5;
const requestGet = (options, maxRetryCount, hooks) => {
    const { onSuccess, onError, onFinish, onRetry, } = hooks || {};
    request_1.default.get(options, (err, _, body) => {
        if (err) {
            if (maxRetryCount < 1) {
                onError && onError(err);
                onFinish && onFinish();
                return;
            }
            setTimeout(() => {
                onRetry && onRetry();
                requestGet(options, maxRetryCount - 1, hooks);
            }, REQUEST_RETRY_DELAY);
            return;
        }
        onSuccess && onSuccess(body);
        onFinish && onFinish();
    });
};
exports.requestGetPromise = (options, dgitOptions, hooks) => new Promise((resolve, reject) => {
    const { maxRetryCount = DEFAULT_MAX_RETRY_COUNT } = dgitOptions;
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
    const { maxRetryCount = DEFAULT_MAX_RETRY_COUNT } = dgitOptions;
    const logger = log_1.createLogger(dgitOptions);
    const { onSuccess, onError, onFinish, onRetry, } = hooks || {};
    const fn = (retryCount) => {
        const downloadUrl = utils_1.AddExtraRandomQs(url);
        logger(` dowloading from ${downloadUrl}...`);
        request_1.default(encodeURI(downloadUrl))
            .on('error', err => {
            if (retryCount <= 0) {
                onError && onError(err);
                onFinish && onFinish();
                return;
            }
            setTimeout(() => {
                onRetry && onRetry();
                fn(retryCount - 1);
            }, REQUEST_RETRY_DELAY);
        })
            .pipe(ws);
    };
    ws.on('finish', () => {
        onSuccess && onSuccess();
        onFinish && onFinish();
    });
    ws.on('error', () => {
        logger(` ${url}, write stream failed.`);
    });
    fn(maxRetryCount);
};
