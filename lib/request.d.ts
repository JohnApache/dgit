/// <reference types="node" />
import fs from 'fs';
import { DgitGlobalOption, DgitLifeCycle } from './type';
import request from 'request';
export declare const requestGetPromise: (options: request.OptionsWithUrl, dgitOptions: DgitGlobalOption, hooks?: DgitLifeCycle | undefined) => Promise<any>;
export declare const requestOnStream: (url: string, ws: fs.WriteStream, dgitOptions: DgitGlobalOption, hooks?: DgitLifeCycle | undefined) => void;
