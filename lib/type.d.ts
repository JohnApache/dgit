export interface DgitGlobalOption {
    maxRetryCount?: number;
    parallelLimit?: number;
    log?: boolean;
    logPrefix?: string;
}
export interface PrivateOption {
    username?: string;
    password?: string;
    token?: string;
}
export interface RepoOptionType extends PrivateOption {
    owner?: string;
    repoName?: string;
    ref?: string;
    relativePath?: string;
    githubLink?: string;
}
export interface RepoTreeNode {
    path: string;
    type: 'blob' | 'tree';
    size: number;
    url: string;
}
export interface DgitLifeCycle {
    onSuccess?: (data?: any) => void;
    onError?: (err?: any) => void;
    onFinish?: () => void;
    onRetry?: () => void;
    onProgress?: (status: ProgressStatus, node: RepoTreeNode) => void;
    onResolved?: (status: ProgressStatus) => void;
}
export interface DgitLoadGitTree {
    beforeLoadTree?: () => void;
    afterLoadTree?: () => void;
}
export interface ProgressStatus {
    currentSize: number;
    currentCount: number;
    totalCount: number;
    totalSize: number;
}
export interface GithubLinkInfo {
    owner: string;
    repoName: string;
    ref: string;
    relativePath: string;
    type: string;
}
