import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { after, describe, it } from 'mocha';
import dgit from '../src/dgit';

describe('dgit功能测试', () => {
    const target = path.resolve(__dirname, '../PLAN.txt');

    const deleteTarget = () => {
        if (fs.existsSync(target)) {
            fs.unlinkSync(target);
        }
    };
    beforeEach(deleteTarget);
    after(deleteTarget);

    it('dgit 能拉取远端git指定目录代码', async () => {
        await dgit(
            {
                owner: 'JohnApache',
                repoName: 'hasaki-cli',
                ref: 'master',
                relativePath: './PLAN.txt',
            },
            './',
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
            './',
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
});
