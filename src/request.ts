import fs from 'fs';
import { DgitGlobalOption, DgitLifeCycle } from './type';
import { AddExtraRandomQs } from './cmd/utils';
import { createLogger } from './log';
import request, { UrlOptions, CoreOptions } from 'request';

type RequestOption = UrlOptions & CoreOptions;

const REQUEST_RETRY_DELAY = 1500;
const DEFAULT_MAX_RETRY_COUNT = 5;

const requestGet = (
    options: RequestOption,
    maxRetryCount: number,
    hooks?: DgitLifeCycle,
): void => {
    const {
        onSuccess, onError, onFinish, onRetry,
    } = hooks || {};

    request.get(options, (err, _, body) => {
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

export const requestGetPromise = (
    options: RequestOption,
    dgitOptions: DgitGlobalOption,
    hooks?: DgitLifeCycle,
): Promise<any> => new Promise((resolve, reject) => {
    const { maxRetryCount = DEFAULT_MAX_RETRY_COUNT } = dgitOptions;

    const {
        onSuccess, onError, onFinish, onRetry,
    } = hooks || {};

    const newHooks: DgitLifeCycle = {
        onSuccess (data: any) {
            resolve(data);
            onSuccess && onSuccess(data);
        },
        onError (err: any) {
            reject(err);
            onError && onError(err);
        },
        onFinish,
        onRetry,
    };

    requestGet(options, maxRetryCount, newHooks);
});

export const requestOnStream = (
    url: string,
    ws: fs.WriteStream,
    dgitOptions: DgitGlobalOption,
    hooks?: DgitLifeCycle,
) => {
    const { maxRetryCount = DEFAULT_MAX_RETRY_COUNT } = dgitOptions;

    const logger = createLogger(dgitOptions);

    const {
        onSuccess, onError, onFinish, onRetry,
    } = hooks || {};

    const fn = (retryCount: number): void => {
        const downloadUrl = AddExtraRandomQs(url);
        logger(` dowloading from ${ downloadUrl }...`);

        request(encodeURI(downloadUrl))
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
        logger(` ${ url }, write stream failed.`);
    });

    fn(maxRetryCount);
};
