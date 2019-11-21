"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const progress_1 = tslib_1.__importDefault(require("progress"));
const ora_1 = tslib_1.__importDefault(require("ora"));
const utils_1 = require("./utils");
const prompt_1 = require("./prompt");
const dgit_1 = tslib_1.__importDefault(require("../dgit"));
const DownloadAction = (githubLink, cmd) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let { ref = '', dest = '', owner = '', repoName = '', relativePath = '', password, } = cmd;
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
    const spinner = ora_1.default(' loading remote repo tree...');
    let bar;
    yield dgit_1.default({
        ref,
        owner,
        repoName,
        relativePath,
        username,
        password,
        token,
    }, dest, {
        log: false,
        parallelLimit: Number(parallelLimit.trim()),
    }, {
        beforeLoadTree() {
            spinner.start();
        },
        afterLoadTree() {
            spinner.succeed(' load remote repo tree succeed! ');
        },
        onResolved(status) {
            // bar = new ProgressBar(
            // ` ${chalk.rgb(0, 4, 0).bgRgb(73, 162, 46).bold(' DOWNLOAD ')} |:bar| ${chalk.whiteBright.bold(':current/:total :percent')} ${chalk.grey('elapsed:')} ${chalk.whiteBright.bold(':elapseds')} ${chalk.grey('eta:')} ${chalk.whiteBright.bold(':eta')} ${chalk.grey.underline(':file')}, ${chalk.whiteBright.bold('done')}.`,
            // {
            //     total: status.totalCount,
            //     width: 50,
            // },
            // );
            const green = '\u001b[42m \u001b[0m';
            const red = '\u001b[41m \u001b[0m';
            bar = new progress_1.default(' DOWNLOAD |:bar| :current/:total :percent elapsed: :elapseds eta: :eta :file, done.', {
                total: status.totalCount,
                width: 50,
                complete: green,
                incomplete: red,
            });
        },
        onProgress(_, node) {
            bar.tick({
                file: utils_1.TextEllipsis(node.path, 30),
            });
        },
    });
    spinner.succeed(' download all files succeed!');
});
exports.default = DownloadAction;
