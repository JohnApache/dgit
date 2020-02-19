"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ora_1 = tslib_1.__importDefault(require("ora"));
const dgit_1 = tslib_1.__importDefault(require("../dgit"));
const utils_1 = require("./utils");
const prompt_1 = require("./prompt");
const progress_1 = tslib_1.__importDefault(require("progress"));
const MAX_TEXT_ELLIPSIS = 30;
const DownloadAction = (githubLink, cmd) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let { ref = '', dest = '', owner = '', repoName = '', relativePath = '', password, } = cmd;
    const { exclude = '', include = '', log = false, logPrefix = '[dgit-logger]', } = cmd;
    const { parallelLimit = '', username, token, } = cmd;
    if (githubLink && utils_1.isHttpsLink(githubLink)) {
        const parseResult = utils_1.ParseGithubHttpsLink(githubLink);
        ref = parseResult.ref;
        owner = parseResult.owner;
        repoName = parseResult.repoName;
        relativePath = parseResult.relativePath;
    }
    if (username && !password) {
        const pwdAnswer = yield prompt_1.PasswordPrompt();
        password = pwdAnswer.password;
    }
    const answer = yield prompt_1.DownloadPrompt({
        ref,
        dest,
        owner,
        repoName,
        relativePath,
    });
    ref = answer.ref;
    dest = answer.dest;
    owner = answer.owner;
    repoName = answer.repoName;
    relativePath = answer.relativePath;
    const excludeList = exclude.split(',').filter(Boolean);
    const includeList = include.split(',').filter(Boolean);
    const spinner = ora_1.default(' loading remote repo tree...');
    let bar;
    try {
        yield dgit_1.default({
            ref,
            owner,
            repoName,
            relativePath,
            username,
            password,
            token,
        }, dest, {
            log,
            logPrefix,
            parallelLimit: Number(parallelLimit.trim()),
            exclude: excludeList,
            include: includeList,
        }, {
            beforeLoadTree() {
                spinner.start();
            },
            afterLoadTree() {
                spinner.succeed(' load remote repo tree succeed! ');
            },
            onResolved(status) {
                if (log)
                    return;
                const green = '\u001b[42m \u001b[0m';
                const red = '\u001b[41m \u001b[0m';
                const index = 0;
                bar = new progress_1.default(' DOWNLOAD |:bar| :current/:total :percent elapsed: :elapseds eta: :eta :file, done.', {
                    total: status.totalCount,
                    width: 50,
                    complete: green,
                    incomplete: red,
                });
                bar.update(index);
            },
            onProgress(_, node) {
                if (log)
                    return;
                bar.tick({ file: utils_1.TextEllipsis(node.path, MAX_TEXT_ELLIPSIS) });
            },
        });
        spinner.succeed(' download all files succeed!');
    }
    catch (error) {
        console.error(error);
    }
});
exports.default = DownloadAction;
