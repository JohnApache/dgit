const repoUtils = (owner: string, repoName: string, ref: string) => ({
    getRepoTreeUrl: () => `https://api.github.com/repos/${ owner }/${ repoName }/git/trees/${ ref }?recursive=1`,
    getDownloadUrl: (path: string) => `https://raw.githubusercontent.com/${ owner }/${ repoName }/${ ref }/${ path }`,
});

export default repoUtils;
