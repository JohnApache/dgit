declare const repoUtils: (owner: string, repoName: string, ref: string) => {
    getRepoTreeUrl: () => string;
    getDownloadUrl: (path: string) => string;
};
export default repoUtils;
