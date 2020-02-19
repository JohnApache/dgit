"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_PREFIX = '[dgit-logger]';
exports.createLogger = (option) => (...message) => {
    if (option && option.log) {
        const prefix = option ?
            option.logPrefix || DEFAULT_PREFIX :
            DEFAULT_PREFIX;
        console.log(prefix, ...message, '\n');
    }
};
