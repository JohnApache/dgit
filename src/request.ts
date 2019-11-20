import request, { UrlOptions, CoreOptions } from 'request';
import { DgitGlobalOption, DgitLifeCycle } from './type';

type RequestOption = UrlOptions & CoreOptions;

const requestGet = (
    options: RequestOption,
    maxRetryCount: number,
    hooks?: DgitLifeCycle,
): void => {
    const {
        onSuccess,
        onError,
        onFinish,
        onRetry,
    } = hooks || {};

    request.get(options, (err, _, body) => {
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

export const requestGetPromise = (
    options: RequestOption,
    dgitOptions: DgitGlobalOption,
    hooks?: DgitLifeCycle,
): Promise<any> => new Promise((resolve, reject) => {
    const {
        maxRetryCount = 5,
    } = dgitOptions;

    const {
        onSuccess,
        onError,
        onFinish,
        onRetry,
    } = hooks || {};

    const newHooks: DgitLifeCycle = {
        onSuccess(data: any) {
            resolve(data);
            onSuccess && onSuccess(data);
        },
        onError(err: any) {
            reject(err);
            onError && onError(err);
        },
        onFinish,
        onRetry,
    };

    requestGet(
        options,
        maxRetryCount,
        newHooks,
    );
});


export const requestOnStream = (
    url: string,
    ws: NodeJS.WritableStream,
    dgitOptions: DgitGlobalOption,
    hooks?: DgitLifeCycle,
) => {
    const {
        maxRetryCount = 5,
    } = dgitOptions;

    const {
        onSuccess,
        onError,
        onFinish,
        onRetry,
    } = hooks || {};

    const fn = (retryCount: number): void => {
        request(encodeURI(url))
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
