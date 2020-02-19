import { DownloadPromptInfo, PasswordPromptInfo } from './type';
import inquirer from 'inquirer';
export declare const CreatePrompt: (questions: inquirer.Question<inquirer.Answers>[]) => Promise<any>;
export declare const DownloadPrompt: (currentInfo: DownloadPromptInfo) => Promise<DownloadPromptInfo>;
export declare const PasswordPrompt: () => Promise<PasswordPromptInfo>;
