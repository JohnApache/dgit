import { DgitGlobalOption, RepoOptionType, DgitLifeCycle, DgitLoadGitTree } from './type';
declare const dgit: (repoOption: RepoOptionType, destPath: string, dgitOptions?: DgitGlobalOption | undefined, hooks?: (DgitLifeCycle & DgitLoadGitTree) | undefined) => Promise<void>;
export default dgit;
