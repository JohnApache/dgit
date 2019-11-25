import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import {
    after, describe, it, before,
} from 'mocha';
import dgit from '../src/dgit';

const Clean = (targets: Array<string>, callback: Function) => {
    targets.forEach((deletePath) => {
        const stat = fs.statSync(deletePath);
        if (stat.isFile()) {
            return fs.unlinkSync(deletePath);
        }
        if (stat.isDirectory()) {
            const nextTargets = fs.readdirSync(deletePath).map((fileName) => `${deletePath}/${fileName}`);
            Clean(nextTargets, () => {
                fs.rmdirSync(deletePath);
            });
        }
    });
    callback();
};

describe('dgit功能测试', () => {
    const baseDir = 'testDir';
    const basePath = path.resolve(__dirname, '../', baseDir);
    const target = path.resolve(basePath, './PLAN.txt');
    const target2 = path.resolve(basePath, './.eslintignore');
    const target3 = path.resolve(basePath, './webpack.config.js');
    const target4 = path.resolve(basePath, './config/webpack.base.js');

    const deleteTarget = (): Promise<void> => new Promise((resolve) => {
        if (fs.existsSync(basePath)) {
            return Clean([basePath], resolve);
        }
        resolve();
    });

    before(deleteTarget);
    after(deleteTarget);

    it('dgit 能拉取远端git指定目录代码', async () => {
        await dgit(
            {
                owner: 'JohnApache',
                repoName: 'hasaki-cli',
                ref: 'master',
                relativePath: './PLAN.txt',
            },
            './testDir',
            {
                log: true,
            },
            {
                onSuccess() {
                    expect(fs.existsSync(target)).to.be.ok;
                },
            },
        );
    });

    it('dgit 能直接使用githubLink方式拉取远端git指定目录代码', async () => {
        await dgit(
            {
                githubLink: 'https://github.com/JohnApache/hasaki-cli/blob/master/PLAN.txt',
            },
            './testDir',
            {
                log: true,
                parallelLimit: 1,
            },
            {
                onSuccess() {
                    expect(fs.existsSync(target)).to.be.ok;
                },
            },
        );
    });

    it('dgit 能直接使用githubLink方式拉取远端git指定深层指定文件代码', async () => {
        await dgit(
            {
                githubLink: 'https://github.com/JohnApache/hasaki-cli/blob/master/assets/.eslintignore',
            },
            './testDir',
            {
                log: true,
                parallelLimit: 1,
            },
            {
                onSuccess() {
                    expect(fs.existsSync(target2)).to.be.ok;
                },
            },
        );
    });

    it('dgit 能直接使用githubLink方式拉取远端git指定深层指定目录代码', async () => {
        await dgit(
            {
                githubLink: 'https://github.com/JohnApache/hasaki-cli/tree/master/assets/webpack',
            },
            './testDir',
            {
                log: true,
                parallelLimit: 1,
            },
            {
                onSuccess() {
                    expect(fs.existsSync(target3)).to.be.ok;
                    expect(fs.existsSync(target4)).to.be.ok;
                },
            },
        );
    });
});
