# Dgit

<!-- [![NPM version][npm-image]][npm-url]
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

> Dgit is a portable tool for downloading the specified directory or file of GitHub Repo. It can be used as a command line for global installation on the terminal, or as a node module. This tool does not rely on the local git, can directly download the specified directory file, reduce the traffic consumption, and is very suitable for scenarios where you want to download large projects, and can directly download the content you need.

- [Install](#install)
- [Usage](#usage)
- [Configuration](#configuration)
- [TIPS](#tips)
- [Example](#example)
- [Questions](#questions)
- [License](#license)

## Install
+ Global Installation
```bash
$ npm install @dking/dgit -g
```
+ Local Installation
```bash
$ npm install @dking/dgit --save
$ yarn add @dking/dgit
```

## Usage
+ Global installation, using as command line
```bash
$ dgit d https://github.com/JohnApache/hasaki-cli/tree/master/src -d ./abc
```

+ Local installation as module
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


## Configuration
+ Global installation, used as command line, configurable parameters
     - Commands:
        * download|d [options] [githubLink]  Download the specified files of the specified repo or all files under the specified directory
    - Options:
        * --owner <ownerName>             Git repository author name
        * --repo-name <repoName>          Git repo name
        * --ref <refName>                 Git repo branch，commit hash or tagname
        * --relative-path <relativePath>  Specifies the relative location of the directory or file that git needs to download. default: '.'
        * -d, --dest <destPath>           Specify the file output directory, either absolute path or relative path of the current terminal execution path
        * -l, --parallel-limit, <number>  Specify the number of concurrent downloads，default: 10.
        * -u, --username, <username>      Specify git account name, configuration parameters required when downloading private repo.
        * -p --password, <password>       Specify the git account password, which is used with username, and the configuration parameters required when downloading the private repo.
        * -t --token, <token>             Git token is another configurable parameter of login mode, which is used to download private repo.
        * -h, --help                      Output usage information

+ Local installation, configurable parameters when used as a module   
    ```js
    import dgit from '@dking/dgit';
    import path from 'path';
    const repoOption = {
        owner: 'JohnApache'; // Git repository author name
        repoName: 'hasaki-cli'; // Git repo name
        ref: 'master'; // Git repo branch，commit hash or tagname，
        relativePath: '.'; // Specifies the relative location of the directory or file that git needs to download
        username: ''; // Specify git account name.
        password: ''; // Specify the git account password.
        token: ''; // Git token is another configurable parameter of login mode.
    }

    const destPath = path.resolve(__dirname, './aaa'); // Specify the file output directory

    const dgitOptions = {
        maxRetryCount: 3; // The maximum number of attempts to download again when the download fails due to network problems
        parallelLimit: 10; // Number of parallel downloads
        log: false; // Open internal log
        logSuffix: ''; // Log output prefix
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
        console.log('download succeed');
    })()
    ``` 

## TIPS
When downloading the private repo, you need to provide download permission. At this time, you need to pass in additional parameters in two ways
+ Basic authentication 

    Download permission is provided by passing in user name and password. When passing in user name, password can not be provided explicitly. When password is not provided, password input option will appear password prompt;
    ```bash
    $ dgit d https://github.com/JohnApache/hasaki-cli/tree/master/src -d ./abc -u JohnApache
    ```
+ OAuth2 token

    Token is another way of authority authentication provided by GitHub.

    Set the token method, which is located in Github Settings -> Developer settings -> Personal access tokens

    ```bash
    $ dgit d https://github.com/JohnApache/hasaki-cli/tree/master/src -d ./abc -t OAUTH-TOKEN
    ```

## Questions
Please open an issue [here](https://github.com/JohnApache/egg-kafka-node/issues).

## License

[MIT](LICENSE)
