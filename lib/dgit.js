"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const async_1 = tslib_1.__importDefault(require("async"));
const repo_1 = tslib_1.__importDefault(require("./repo"));
const log_1 = require("./log");
const request_1 = require("./request");
const utils_1 = require("./cmd/utils");
const UserAgent = '@dking/dgit';
const dgit = (repoOption, destPath, dgitOptions, hooks) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { username, password, token, githubLink, } = repoOption;
    let { owner, repoName, ref = 'master', relativePath = '.', } = repoOption;
    if (githubLink && utils_1.isHttpsLink(githubLink)) {
        const parseResult = utils_1.ParseGithubHttpsLink(githubLink);
        owner = parseResult.owner;
        repoName = parseResult.repoName;
        ref = parseResult.ref;
        relativePath = parseResult.relativePath;
    }
    if (!owner || !repoName) {
        throw new Error('invalid repo option.');
    }
    const logger = log_1.createLogger(dgitOptions);
    let { parallelLimit = 10 } = dgitOptions || {};
    if (!parallelLimit || parallelLimit <= 0) {
        logger('parallelLimit value is invalid.');
        parallelLimit = 10;
    }
    parallelLimit > 100 && (parallelLimit = 100);
    const { onSuccess, onError, onProgress, onFinish, onRetry, onResolved, beforeLoadTree, afterLoadTree, } = hooks || {};
    let onSuccessResolve = () => { };
    let onErrorReject = () => { };
    const prom = new Promise((resolve, reject) => {
        onSuccessResolve = resolve;
        onErrorReject = reject;
    });
    const { getRepoTreeUrl, getDownloadUrl } = repo_1.default(owner, repoName, ref);
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
    destPath = path_1.default.isAbsolute(destPath) ? destPath : path_1.default.resolve(process.cwd(), destPath);
    logger(' request repo tree options.');
    logger(JSON.stringify(options, null, 2));
    try {
        logger(' loading remote repo tree...');
        beforeLoadTree && beforeLoadTree();
        const body = yield request_1.requestGetPromise(options, dgitOptions || {}, {
            onRetry() {
                logger(` request ${url} failed. Retrying...`);
                onRetry && onRetry();
            },
        });
        logger(' loading remote repo tree succeed.');
        afterLoadTree && afterLoadTree();
        const result = JSON.parse(body);
        if (!result.tree || result.tree.length <= 0) {
            throw new Error('404 repo not found!');
        }
        const treeNodeList = result.tree;
        const includeTreeNodeList = treeNodeList.filter((node) => (path_1.default.resolve(__dirname, node.path).startsWith(path_1.default.resolve(__dirname, relativePath))
            && (node.type === 'blob')));
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
        async_1.default.eachLimit(includeTreeNodeList, parallelLimit, (node, callback) => {
            const downloadUrl = getDownloadUrl(node.path);
            const rPath = path_1.default.resolve(destPath, relativePath);
            const tPath = path_1.default.resolve(destPath, node.path);
            const root = path_1.default.resolve(destPath, '.');
            let targetPath;
            if (rPath === tPath) {
                targetPath = path_1.default.resolve(destPath, path_1.default.basename(tPath));
            }
            else {
                targetPath = tPath.replace(rPath, root);
            }
            logger(node.path, relativePath, targetPath);
            if (!fs_1.default.existsSync(path_1.default.dirname(targetPath))) {
                fs_1.default.mkdirSync(path_1.default.dirname(targetPath), { recursive: true });
            }
            const ws = fs_1.default.createWriteStream(targetPath);
            request_1.requestOnStream(downloadUrl, ws, dgitOptions || {}, {
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
                    if (currentCount === totalStatus.count
                        && currentSize === totalStatus.size) {
                        onSuccess && onSuccess();
                        onFinish && onFinish();
                        callback();
                        onSuccessResolve();
                    }
                    else {
                        callback();
                    }
                },
                onRetry() {
                    logger(` request ${url} failed. Retrying...`);
                    onRetry && onRetry();
                },
            });
        });
    }
    catch (error) {
        onError && onError(error);
        onFinish && onFinish();
        onErrorReject(error);
    }
    return prom;
});
exports.default = dgit;
