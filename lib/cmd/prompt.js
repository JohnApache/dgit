"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.CreatePrompt = (questions) => inquirer_1.default.prompt(questions);
exports.DownloadPrompt = (currentInfo) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (currentInfo.owner &&
        currentInfo.repoName &&
        currentInfo.ref &&
        currentInfo.relativePath &&
        currentInfo.dest)
        return currentInfo;
    const questions = [
        {
            type: 'input',
            name: 'owner',
            when() {
                return !currentInfo.owner;
            },
            validate(input) {
                return input && input.length > 0;
            },
            message: 'input github ownername.',
        },
        {
            type: 'input',
            name: 'repoName',
            when() {
                return !currentInfo.repoName;
            },
            validate(input) {
                return input && input.length > 0;
            },
            message: 'input github repoName.',
        },
        {
            type: 'input',
            name: 'ref',
            when() {
                return !currentInfo.ref;
            },
            validate(input) {
                return input && input.length > 0;
            },
            'default': 'master',
            message: 'input github branch or commit hash or tagname.',
        },
        {
            type: 'input',
            name: 'relativePath',
            when() {
                return !currentInfo.relativePath;
            },
            validate(input) {
                return input && input.length > 0;
            },
            'default': '.',
            message: 'input github relative path.',
        },
        {
            type: 'input',
            name: 'dest',
            when() {
                return !currentInfo.dest;
            },
            validate(input) {
                return input && input.length > 0;
            },
            'default': '.',
            message: 'input template output dest path.',
        },
    ];
    const answer = yield exports.CreatePrompt(questions);
    return {
        owner: answer.owner || currentInfo.owner,
        dest: answer.dest || currentInfo.dest,
        repoName: answer.repoName || currentInfo.repoName,
        relativePath: answer.relativePath || currentInfo.relativePath,
        ref: answer.ref || currentInfo.ref,
    };
});
exports.PasswordPrompt = () => {
    const question = {
        type: 'password',
        name: 'password',
        validate(input) {
            return input && input.length > 0;
        },
        message: 'input github account password.',
    };
    return exports.CreatePrompt([question]);
};
