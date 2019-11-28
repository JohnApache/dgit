import { Command } from 'commander';
import ProgressBar from 'progress';
import ora, { Ora } from 'ora';
import { ParseGithubHttpsLink, TextEllipsis, isHttpsLink } from './utils';
import { CommandInfo } from './type';

import { DownloadPrompt, PasswordPrompt } from './prompt';
import dgit from '../dgit';

const DownloadAction = async (
    githubLink: string | undefined,
    cmd: Command & CommandInfo,
): Promise<any> => {
    let {
        ref = '',
        dest = '',
        owner = '',
        repoName = '',
        relativePath = '',
        password,
    } = cmd;

    const { parallelLimit = '', username, token } = cmd;

    if (githubLink && isHttpsLink(githubLink)) {
        const parseResult = ParseGithubHttpsLink(githubLink);
        ref = parseResult.ref;
        owner = parseResult.owner;
        repoName = parseResult.repoName;
        relativePath = parseResult.relativePath;
    }

    if (username && !password) {
        const pwdAnswer = await PasswordPrompt();
        password = pwdAnswer.password;
    }

    const answer = await DownloadPrompt({
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

    const spinner: Ora = ora(' loading remote repo tree...');
    let bar: ProgressBar;

    await dgit(
        {
            ref,
            owner,
            repoName,
            relativePath,
            username,
            password,
            token,
        },
        dest,
        {
            log: false,
            parallelLimit: Number(parallelLimit.trim()),
        },
        {
            beforeLoadTree() {
                spinner.start();
            },
            afterLoadTree() {
                spinner.succeed(' load remote repo tree succeed! ');
            },
            onResolved(status) {
                const green = '\u001b[42m \u001b[0m';
                const red = '\u001b[41m \u001b[0m';
                bar = new ProgressBar(
                    ' DOWNLOAD |:bar| :current/:total :percent elapsed: :elapseds eta: :eta :file, done.',
                    {
                        total: status.totalCount,
                        width: 50,
                        complete: green,
                        incomplete: red,
                    },
                );
            },
            onProgress(_, node) {
                bar.tick({
                    file: TextEllipsis(node.path, 30),
                });
            },
        },
    );

    spinner.succeed(' download all files succeed!');
};

export default DownloadAction;
