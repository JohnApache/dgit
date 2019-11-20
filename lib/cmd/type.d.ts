export interface PackageInfo {
    version: string;
    name: string;
}
export interface CommandInfo {
    dest?: string;
    owner?: string;
    repoName?: string;
    ref?: string;
    relativePath?: string;
    parallelLimit?: string;
    username?: string;
    password?: string;
    token?: string;
}
export interface DownloadPromptInfo {
    dest: string;
    owner: string;
    repoName: string;
    ref: string;
    relativePath: string;
}
export interface GithubLinkInfo {
    owner: string;
    repoName: string;
    ref: string;
    relativePath: string;
    type: string;
}
export interface PasswordPromptInfo {
    password: string;
}
