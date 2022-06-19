import * as path from "path";
import * as webpack from "webpack";

const configuration: webpack.Configuration = {
    entry: './src/index.js',
    target: 'node',
    mode: process.env.NODE_ENV as 'production' | 'development' | undefined ?? 'development',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                use: [ 'babel-loader' ],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '...', '.ts', '.tsx' ] 
    }
};

export default configuration;
