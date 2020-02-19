module.exports = {
    parser       : '@typescript-eslint/parser',  // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion : 2018, // Allows for the parsing of modern ECMAScript features
        sourceType  : 'module', // Allows for the use of imports
        ecmaFeatures: {},
    },
    'extends': [ '@dking/typescript' ],
    settings : {
        'import/parsers': {
            '@typescript-eslint/parser': [
                '.ts',
                '.tsx',
            ],
        },
        'import/resolver': {
        // use <root>/path/to/folder/tsconfig.json
            typescript: { directory: './tsconfig.json' },
        },
    },
    env: {
        browser : true, // enable all browser global variables
        commonjs: true,
        es6     : true,
        jest    : true,
        node    : true,
    },

    rules: {},
};
