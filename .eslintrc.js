module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true, // add node environment
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended", // if you are using React
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true, // enable JSX if you are using React
        },
        "ecmaVersion": 12,
        "sourceType": "module",
    },
    "plugins": [
        "react", // if you are using React
    ],
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
    },
};
