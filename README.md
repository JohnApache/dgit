# Dgit 
<!-- 
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/:packageName.svg?style=flat-square
[npm-url]: https://npmjs.org/package/:packageName
[travis-image]: https://www.travis-ci.org/JohnApache/:packageName.svg
[travis-url]: https://travis-ci.org/JohnApache/:packageName
[codecov-image]: https://codecov.io/gh/JohnApache/:packageName/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/JohnApache/:packageName
[snyk-image]: https://snyk.io/test/github/JohnApache/:packageName/badge.svg?targetFile=package.json
[snyk-url]: https://snyk.io/test/github/JohnApache/:packageName?targetFile=package.json
[download-image]: https://img.shields.io/npm/dm/:packageName.svg?style=flat-square
[download-url]: https://npmjs.org/package/:packageName -->

- [English](README.en_US.md)
- [简体中文](README.md)

> Dgit 是一个便携下载 github 仓库指定目录或者指定文件的工具，它可以作为命令行全局安装在终端使用，也可以作为node模块加载使用。 该工具不依赖本地git，可以直接下载指定目录指定文件，减少流量消耗，对于希望下载很大项目的场景非常适合，可以直接下载你需要的内容。

- [安装](#安装)
- [使用](#使用)
- [配置](#配置)
- [注意](#注意)
- [示例](#示例)
- [建议](#建议)
- [License](#license)

## 安装
+ 全局安装
```bash
$ npm install @dking/dgit -g
```
+ 本地安装
```bash
$ npm install @dking/dgit --save
$ yarn add @dking/dgit
```

## 使用
+ 全局安装，作为命令行使用
```bash
$ dgit d https://github.com/JohnApache/hasaki-cli/tree/master/src -d ./abc
```

+ 本地安装，作为模块使用
```js
import dgit from '@dking/dgit';

(async () => {
    await dgit(
        {
            owner: 'JohnApache',
            repoName: 'hasaki-cli',
            ref: 'master',
            relativePath: 'src',
        },
        './aaa',
    );
    console.log('download succeed');
})()
```

## 配置
+ 全局安装，作为命令行使用，可配置参数
    - Commands:
        * download|d [options] [githubLink]  下载指定仓库的指定文件，或指定目录下的所有文件.
    - Options:
        * --owner <ownerName>             git 仓库作者名，当不指定 githubLink的时候可以使用.
        * --repo-name <repoName>          git 仓库名称，当不指定 githubLink的时候可以使用.
        * --ref <refName>                 git 仓库指定 branch，commit hash 或 tagname，当不指定 githubLink的时候可以使用.
        * --relative-path <relativePath>  指定git所需要下载的目录或者文件相对位置，默认为当前目录 '.'
        * -d, --dest <destPath>           指定文件输出目录，可以是绝对路径，也可以是当前终端执行路径的相对路径.
        * -l, --parallel-limit, <number>  指定并行下载数量，默认为 10.
        * -u, --username, <username>      指定git用户名, 在下载私有仓库时需要的配置参数.
        * -p --password, <password>       指定git密码, 同username 一起使用，在下载私有仓库时需要的配置参数.
        * -t --token, <token>             git token 是另一种登录方式的可配置参数，用于下载私有仓库.
        * -e --exclude, <relativePath,...,relativePath>  指定当前下载目录需要排除的文件或目录路径集合.
        * -i --include, <relativePath,...,relativePath>  指定当前排除的文件路径集合中需要重新包含的文件或目录集合.
        * -h, --help                      帮助文档

+ 局部安装，作为模块使用时，可配置参数
    ```js
    import dgit from '@dking/dgit';
    import path from 'path';
    const repoOption = {
        owner: 'JohnApache'; // git 仓库作者名
        repoName: 'hasaki-cli'; // git 仓库名称
        ref: 'master'; // git 仓库指定 branch，commit 或 tag，
        relativePath: '.'; // 指定git所需要下载的目录或者文件相对位置
        username: ''; // 指定git用户名, 在下载私有仓库时需要的配置参数.
        password: ''; // 指定git密码, 同username 一起使用，在下载私有仓库时需要的配置参数.
        token: ''; // git token 是另一种登录方式的可配置参数，用于下载私有仓库.
    }

    const githubLinkOption = {
        githubLink: 'https://github.com/JohnApache/hasaki-cli/blob/master/PLAN.txt', // 也可以直接指定github 需要下载路径的地址
    }

    const destPath = path.resolve(__dirname, './aaa'); // 目标下载路径

    const dgitOptions = {
        maxRetryCount: 3, // 网络问题下载失败时尝试最大重新下载次数
        parallelLimit: 10, // 并行下载个数
        log: false, // 是否开启内部日志
        logSuffix: '', // 日志前缀
        exclude: [], // 需要排除的文件路径,
        include: [], // 需要包含的文件路径
    }

    const hooks = {
        onSuccess: () => void,
        onError: (err) => err,
        onProgress: (status, node) => void,
        onResolved: (status) => void,
    }


    (async () => {
        await dgit(
            repoOption,
            destPath,
            dgitOptions,
            hooks,
        );
        console.log('repoOption download succeed.');

        await dgit(
            githubLinkOption,
            destPath,
            dgitOptions,
            hooks,
        );
        console.log('githubLinkOption download succeed.');
    })()
    ```    
## 注意
在下载私有仓库的时候需要提供下载权限，此时需要传入额外的参数，方式有两种
+ Basic authentication 

    通过传入 用户名 和 密码，来提供下载权限, 当传入用户名，可以不显式提供密码，在没有提供密码时，会单独出现密码提示

    ```bash
    $ dgit d https://github.com/JohnApache/hasaki-cli/tree/master/src -d ./abc -u JohnApache
    ```
+ OAuth2 token

    Token 是另一种 github 提供的权限认证的方式。

    设置token方法 ，就位于Github Settings -> Developer settings -> Personal access tokens

    ```bash
    $ dgit d https://github.com/JohnApache/hasaki-cli/tree/master/src -d ./abc -t OAUTH-TOKEN
    ```

## 建议
欢迎创建issue 或者 pr [here](https://github.com/JohnApache/egg-kafka-node/issues).

## License

[MIT](LICENSE)
