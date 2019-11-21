import { PackageInfo, GithubLinkInfo } from './type';
export declare const GetPackageInfo: () => PackageInfo;
export declare const GITHUB_ADDRESS = "https://github.com/";
export declare const isHttpsLink: (link: string) => boolean;
export declare const ParseGithubHttpsLink: (httpsLink: string) => GithubLinkInfo;
export declare const TextEllipsis: (text: string, maxLen: number) => string;
