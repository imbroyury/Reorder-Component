const path = require('path');

module.exports = {
    entry: {
        index: './scripts/main.ts'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            }
        ]
    },
    mode: 'development',
    devtool: 'source-map',
    watch: true
};