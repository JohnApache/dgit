import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import dgit from '../src/dgit';

describe('dgit功能测试', () => {
    it('dgit 能拉取远端git指定目录代码', async () => {
        await dgit(
            {
                owner: 'JohnApache',
                repoName: 'hasaki-cli',
                ref: 'master',
                relativePath: 'src/command',
            },
            './aaa',
            {
                log: true,
            },
            {
                onSuccess() {
                    expect(fs.existsSync(
                        path.resolve(__dirname, '../ddddd/src/command/index.ts'),
                    )).to.be.ok;
                },
            },
        );
    });
});
