import program from 'commander';
import chalk from 'chalk';

import { PackageInfo } from './type';
import { GetPackageInfo } from './utils';
import DownloadAction from './action';

const Exit = (): void => {
    process.exit(1);
};

const UnknownCommand = (cmdName: string): void => {
    console.log(`${chalk.red('Unknown command')} ${chalk.yellow(cmdName)}.`);
};

const packageInfo: PackageInfo = GetPackageInfo();

program.version(packageInfo.version);

program
    .command('download [githubLink]')
    .option(
        '--owner <ownerName>',
        'git repo author.',
    )
    .option(
        '--repo-name <repoName>',
        'git repo name.',
    )
    .option(
        '--ref <refName>',
        'git repo branch, commit hash or tagname.',
    )
    .option(
        '--relative-path <relativePath>',
        'specified repo relative path to download.',
    )
    .option(
        '-d, --dest <destPath>',
        'specified dest path.',
    )
    .option(
        '-l, --parallel-limit, <number>',
        'specified download max parallel limit.',
    )
    .option(
        '-u, --username, <username>',
        'specified git account username.',
    )
    .option(
        '-p --password, <password>',
        'specified git account password.',
    )
    .option(
        '-t --token, <token>',
        'specified git account personal access token.',
    )
    .alias('d')
    .description('download the file with the specified path of the remote repo.')
    .action(DownloadAction);


program.on('command:*', (cmdObj = []) => {
    const [cmd, envs] = cmdObj;
    if (cmd) {
        program.outputHelp();
        UnknownCommand(cmd);
        Exit();
    }
});

if (process.argv.slice(2).length <= 0) {
    program.help();
}

program.parse(process.argv);
