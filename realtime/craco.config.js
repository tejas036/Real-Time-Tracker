const webpack = require("webpack");

module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    crypto: require.resolve("crypto-browserify"),
                },
            },
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: "process/browser",
            }),
        ],
        resolve: {
            fallback: {
                crypto: require.resolve("crypto-browserify"),
            },
        },
    },
};
