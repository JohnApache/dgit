import fs from 'fs';
import path from 'path';
import async from 'async';
import repo from './repo';
import { createLogger } from './log';
import { requestGetPromise, requestOnStream } from './request';
import {
    DgitGlobalOption,
    RepoOptionType,
    RepoTreeNode,
    DgitLifeCycle,
    DgitLoadGitTree,
} from './type';
import {
    ParseGithubHttpsLink, isHttpsLink, MakeDirs,
} from './cmd/utils';

const UserAgent = '@dking/dgit';
const DEFAULT_PARALLEL_LIMIT = 10;
const MAX_PARALLEL_LIMIT = 100;
const JSON_STRINGIFY_PADDING = 2;

const dgit = async (
    repoOption: RepoOptionType,
    dPath: string,
    dgitOptions?: DgitGlobalOption,
    hooks?: DgitLifeCycle & DgitLoadGitTree,
): Promise<void> => {
    const {
        username, password, token, githubLink,
    } = repoOption;

    let {
        owner, repoName, ref = 'master', relativePath = '.',
    } = repoOption;

    if (githubLink && isHttpsLink(githubLink)) {
        const parseResult = ParseGithubHttpsLink(githubLink);
        owner = parseResult.owner;
        repoName = parseResult.repoName;
        ref = parseResult.ref;
        relativePath = parseResult.relativePath;
    }

    if (!owner || !repoName) {
        throw new Error('invalid repo option.');
    }

    const logger = createLogger(dgitOptions);

    const { exclude = [], include = []} = dgitOptions || {};

    let { parallelLimit = DEFAULT_PARALLEL_LIMIT } = dgitOptions || {};
    if (!parallelLimit || parallelLimit <= 0) {
        logger('parallelLimit value is invalid.');
        parallelLimit = DEFAULT_PARALLEL_LIMIT;
    }

    parallelLimit > MAX_PARALLEL_LIMIT && (parallelLimit = MAX_PARALLEL_LIMIT);

    const {
        onSuccess,
        onError,
        onProgress,
        onFinish,
        onRetry,
        onResolved,
        beforeLoadTree,
        afterLoadTree,
    } = hooks || {};

    let onSuccessResolve: (data?: any)=> void = () => {};
    let onErrorReject: (err?: any)=> void = () => {};

    const prom: Promise<void> = new Promise((resolve, reject) => {
        onSuccessResolve = resolve;
        onErrorReject = reject;
    });

    const { getRepoTreeUrl, getDownloadUrl } = repo(owner, repoName, ref);
    const url = getRepoTreeUrl();

    const headers = {
        'User-Agent' : UserAgent,
        Authorization: token ? `token ${ token }` : undefined,
    };

    const auth = username && password ?
        {
            user           : username,
            pass           : password,
            sendImmediately: true,
        } :
        undefined;

    const options = {
        url, headers, auth,
    };

    const destPath = path.isAbsolute(dPath) ? dPath : path.resolve(process.cwd(), dPath);

    logger(' request repo tree options.');
    logger(JSON.stringify(options, null, JSON_STRINGIFY_PADDING));

    try {
        logger(' loading remote repo tree...');
        beforeLoadTree && beforeLoadTree();
        const body = await requestGetPromise(options, dgitOptions || {}, {
            onRetry () {
                logger(` request ${ url } failed. Retrying...`);
                onRetry && onRetry();
            },
        });

        logger(' loading remote repo tree succeed.');
        afterLoadTree && afterLoadTree();
        const result = JSON.parse(body);

        if (!result.tree || result.tree.length <= 0) {
            throw new Error('404 repo not found!');
        }

        const treeNodeList: RepoTreeNode[] = result.tree;
        const includeTreeNodeList = treeNodeList.filter(node => {
            const nPath = path.resolve(__dirname, node.path);
            const rPath = path.resolve(__dirname, relativePath);
            if (!nPath.startsWith(rPath) || node.type !== 'blob') {
                return false;
            }
            if (
                exclude.some(v => nPath.startsWith(path.resolve(rPath, v))) &&
                include.every(v => !nPath.startsWith(path.resolve(rPath, v)))
            ) {
                return false;
            }
            return true;
        });

        if (includeTreeNodeList.length <= 0) {
            throw new Error(`404 repo ${ relativePath } not found!`);
        }

        const totalStatus = includeTreeNodeList.reduce(
            (prev, cur) => {
                if (cur.type === 'blob') {
                    prev.size += cur.size;
                    prev.count++;
                }
                return prev;
            },
            { size: 0, count: 0 },
        );

        let currentSize = 0;
        let currentCount = 0;

        onResolved &&
            onResolved({
                currentSize,
                currentCount,
                totalSize : totalStatus.size,
                totalCount: totalStatus.count,
            });

        logger(' include files resolved.');
        logger(
            '',
            JSON.stringify({
                currentSize,
                currentCount,
                totalSize : totalStatus.size,
                totalCount: totalStatus.count,
            }),
        );

        async.eachLimit(
            includeTreeNodeList,
            parallelLimit,
            (node, callback) => {
                const downloadUrl = getDownloadUrl(node.path);

                const rPath = path.resolve(destPath, relativePath);
                const tPath = path.resolve(destPath, node.path);
                const root = path.resolve(destPath, '.');

                let targetPath: string;
                if (rPath === tPath) {
                    targetPath = path.resolve(destPath, path.basename(tPath));
                } else {
                    targetPath = tPath.replace(rPath, root);
                }

                logger('', node.path, relativePath, targetPath);

                if (!fs.existsSync(path.dirname(targetPath))) {
                    MakeDirs(path.dirname(targetPath));
                }

                const ws = fs.createWriteStream(targetPath);

                logger(` downloading from ${ downloadUrl }...`);

                requestOnStream(downloadUrl, ws, dgitOptions || {}, {
                    onSuccess () {
                        currentCount++;
                        currentSize += node.size;

                        logger(` write file ${ node.path } succeed. 
                            size: [${ currentSize }/${ totalStatus.size }], 
                            count: [${ currentCount }/${ totalStatus.count }]`);

                        onProgress &&
                            onProgress(
                                {
                                    totalCount: totalStatus.count,
                                    totalSize : totalStatus.size,
                                    currentSize,
                                    currentCount,
                                },
                                node,
                            );

                        callback();
                    },
                    onError (err) {
                        logger('', err);
                        callback(new Error(` request ${ downloadUrl } failed.`));
                    },
                    onRetry () {
                        logger(` request ${ downloadUrl } failed. Retrying...`);
                        onRetry && onRetry();
                    },
                });
            },
            err => {
                if (err) {
                    onError && onError(err);
                    onFinish && onFinish();
                    onErrorReject(err);
                } else {
                    onSuccess && onSuccess();
                    onFinish && onFinish();
                    onSuccessResolve();
                }
            },
        );
    } catch (error) {
        onError && onError(error);
        onFinish && onFinish();
        onErrorReject(error);
    }

    return prom;
};

export default dgit;
