import fs from 'fs';
import path from 'path';
import async from 'async';
import repo from './repo';
import { createLogger } from './log';
import { requestGetPromise, requestOnStream } from './request';
import {
    DgitGlobalOption, RepoOptionType, RepoTreeNode, DgitLifeCycle, DgitLoadGitTree,
} from './type';
import { ParseGithubHttpsLink, isHttpsLink } from './cmd/utils';

const UserAgent = '@dking/dgit';


const dgit = async (
    repoOption: RepoOptionType,
    destPath: string,
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

    let { parallelLimit = 10 } = dgitOptions || {};
    if (!parallelLimit || parallelLimit <= 0) {
        logger('parallelLimit value is invalid.');
        parallelLimit = 10;
    }

    parallelLimit > 100 && (parallelLimit = 100);

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


    let onSuccessResolve: (data?: any) => void = () => {};
    let onErrorReject: (err?: any) => void = () => {};

    const prom: Promise<void> = new Promise((resolve, reject) => {
        onSuccessResolve = resolve;
        onErrorReject = reject;
    });

    const { getRepoTreeUrl, getDownloadUrl } = repo(owner, repoName, ref);
    const url = getRepoTreeUrl();

    const headers = {
        'User-Agent': UserAgent,
        Authorization: token ? `token ${token}` : undefined,
    };

    const auth = (username && password) ? {
        user: username,
        pass: password,
        sendImmediately: true,
    } : undefined;

    const options = { url, headers, auth };
    destPath = path.isAbsolute(destPath) ? destPath : path.resolve(process.cwd(), destPath);

    logger(' request repo tree options.');
    logger(JSON.stringify(options, null, 2));

    try {
        logger(' loading remote repo tree...');
        beforeLoadTree && beforeLoadTree();
        const body = await requestGetPromise(
            options,
            dgitOptions || {},
            {
                onRetry() {
                    logger(` request ${url} failed. Retrying...`);
                    onRetry && onRetry();
                },
            },
        );

        logger(' loading remote repo tree succeed.');
        afterLoadTree && afterLoadTree();
        const result = JSON.parse(body);

        if (!result.tree || result.tree.length <= 0) {
            throw new Error('404 repo not found!');
        }

        const treeNodeList: RepoTreeNode[] = result.tree;
        const includeTreeNodeList = treeNodeList.filter((node) => (
            path.resolve(__dirname, node.path).startsWith(path.resolve(__dirname, relativePath))
            && (node.type === 'blob')
        ));

        if (includeTreeNodeList.length <= 0) {
            throw new Error(`404 repo ${relativePath} not found!`);
        }

        const totalStatus = includeTreeNodeList.reduce((prev, cur) => {
            if (cur.type === 'blob') {
                prev.size += cur.size;
                prev.count++;
            }
            return prev;
        }, { size: 0, count: 0 });

        let currentSize = 0;
        let currentCount = 0;

        onResolved && onResolved({
            currentSize,
            currentCount,
            totalSize: totalStatus.size,
            totalCount: totalStatus.count,
        });

        async.eachLimit(includeTreeNodeList, parallelLimit, (node, callback) => {
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

            logger(node.path, relativePath, targetPath);

            if (!fs.existsSync(path.dirname(targetPath))) {
                fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            }

            const ws = fs.createWriteStream(targetPath);

            requestOnStream(
                downloadUrl,
                ws,
                dgitOptions || {},
                {
                    onSuccess() {
                        currentCount++;
                        currentSize += node.size;

                        logger(`write file ${node.path} succeed. 
                            size: [${currentSize}/${totalStatus.size}], 
                            count: [${currentCount}/${totalStatus.count}]`);

                        onProgress && onProgress({
                            totalCount: totalStatus.count,
                            totalSize: totalStatus.size,
                            currentSize,
                            currentCount,
                        }, node);

                        if (
                            currentCount === totalStatus.count
                            && currentSize === totalStatus.size
                        ) {
                            onSuccess && onSuccess();
                            onFinish && onFinish();
                            callback();
                            onSuccessResolve();
                        } else {
                            callback();
                        }
                    },
                    onRetry() {
                        logger(` request ${url} failed. Retrying...`);
                        onRetry && onRetry();
                    },
                },
            );
        });
    } catch (error) {
        onError && onError(error);
        onFinish && onFinish();
        onErrorReject(error);
    }

    return prom;
};

export default dgit;
