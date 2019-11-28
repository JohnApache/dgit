import inquirer, { Question } from 'inquirer';
import { DownloadPromptInfo, PasswordPromptInfo } from './type';

export const CreatePrompt = (questions: Array<Question>): Promise<any> => inquirer.prompt(questions);

export const DownloadPrompt = async (
    currentInfo: DownloadPromptInfo,
): Promise<DownloadPromptInfo> => {
    if (
        currentInfo.owner
        && currentInfo.repoName
        && currentInfo.ref
        && currentInfo.relativePath
        && currentInfo.dest
    ) return currentInfo;

    const questions = [
        {
            type: 'input',
            name: 'owner',
            when() {
                return !currentInfo.owner;
            },
            validate(input: string) {
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
            validate(input: string) {
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
            validate(input: string) {
                return input && input.length > 0;
            },
            default: 'master',
            message: 'input github branch or commit hash or tagname.',
        },
        {
            type: 'input',
            name: 'relativePath',
            when() {
                return !currentInfo.relativePath;
            },
            validate(input: string) {
                return input && input.length > 0;
            },
            default: '.',
            message: 'input github relative path.',
        },
        {
            type: 'owner',
            name: 'dest',
            when() {
                return !currentInfo.dest;
            },
            validate(input: string) {
                return input && input.length > 0;
            },
            message: 'input template output dest path.',
        },
    ];

    const answer = await CreatePrompt(questions);
    return {
        owner: answer.owner || currentInfo.owner,
        dest: answer.dest || currentInfo.dest,
        repoName: answer.repoName || currentInfo.repoName,
        relativePath: answer.relativePath || currentInfo.relativePath,
        ref: answer.ref || currentInfo.ref,
    };
};

export const PasswordPrompt = (): Promise<PasswordPromptInfo> => {
    const question = {
        type: 'password',
        name: 'password',
        validate(input: string) {
            return input && input.length > 0;
        },
        message: 'input github account password.',
    };
    return CreatePrompt([question]);
};
