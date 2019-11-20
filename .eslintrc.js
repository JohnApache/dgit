module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {},
    },
    extends: [
        'airbnb-base', // Uses airbnb, it including the react rule(eslint-plugin-react/eslint-plugin-jsx-a11y)
        'plugin:@typescript-eslint/recommended', // Optional enable, will more stricter
        'plugin:import/typescript', // Use prettier/react to pretty react syntax
        'plugin:promise/recommended',
        // 'plugin:prettier/recommended',
        // 'prettier/@typescript-eslint'
    ],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            // use <root>/path/to/folder/tsconfig.json
            typescript: {
                directory: './tsconfig.json',
            },
        },
    },
    env: {
        browser: true, // enable all browser global variables
        commonjs: true,
        es6: true,
        jest: true,
        node: true,
    },
    plugins: ['@typescript-eslint', 'promise'],
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. '@typescript-eslint/explicit-function-return-type': 'off',
        'no-useless-constructor': 0,
        'no-console': 0,
        'class-methods-use-this': 0,
        indent: ['error', 4],
        'func-names': 0,
        'no-unused-expressions': 0,
        'no-plusplus': 0,
        'import/prefer-default-export': 0,
        'no-param-reassign': 0,
        'max-len': [
            'error',
            {
                code: 120,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
            },
        ],
        'consistent-return': 0,

        /**
         * @description rules of @typescript-eslint
         */
        '@typescript-eslint/prefer-interface': 'off', // also want to use 'type'
        '@typescript-eslint/explicit-function-return-type': 'off', // annoying to force return type
        '@typescript-eslint/indent': ['error', 4], // avoid conflict with airbn
        '@typescript-eslint/no-explicit-any': 'off',

        /**
         * @description rules of eslint-plugin-prettier
         */
        // 'prettier/prettier': [
        //   error, {
        //     singleQuote: true,
        //     semi: false
        //   }
        // ]
    },
};
