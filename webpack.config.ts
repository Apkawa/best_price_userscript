import webpack from 'webpack';
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import TerserPlugin from 'terser-webpack-plugin';
import {PackageJson} from 'type-fest';
import fromEntries from 'fromentries';
import {Configuration as DevServerConfiguration} from 'webpack-dev-server'

const packageJson: PackageJson = require('./package.json');


const DOWNLOAD_SUFFIX = process.env.DOWNLOAD_SUFFIX || `/raw/master/dist/`
const DOWNLOAD_ROOT = `${packageJson.repository}${DOWNLOAD_SUFFIX}`;

console.log(`DOWNLOAD_ROOT=${DOWNLOAD_ROOT}`)

function collectUserScripts() {
  let root = path.resolve(__dirname, 'src');
  return fromEntries(glob.sync(root + '/**/*.user.[tj]s').map(f => {
    let relPath = path.relative(root, f);
    let bName = path.basename(path.basename(relPath, '.js'), '.ts');
    let name = `${path.dirname(relPath)}/${bName}`;
    return [name, f];
  }));
}

function getExtraInfo(data: BannerDataType) {
  const homepage = packageJson.homepage;
  let supportUrl = packageJson.bugs;
  if (typeof supportUrl !== 'string') {
    supportUrl = supportUrl?.url;
  }
  const downloadUrl = `${DOWNLOAD_ROOT}${data.chunk.name}.js`;
  let author = packageJson.author;
  if (typeof author !== 'string') {
    author = author?.name;
  }

  return {
    author,
    homepage,
    homepageURL: homepage,
    supportURL: supportUrl,
    downloadURL: downloadUrl,
    updateURL: downloadUrl,
    license: packageJson.license,
    version: packageJson.version,
  };
}

type BannerDataType = {hash?: string; chunk: webpack.Chunk; filename: string}

function buildUserScriptMeta(data: BannerDataType): string {
  let src_path = path.resolve(__dirname, `src/${data.chunk.name}.ts`);
  if (!fs.existsSync(src_path)) {
    src_path = path.resolve(__dirname, `src/${data.chunk.name}.js`);
  }
  let text = fs.readFileSync(src_path, 'utf-8')
    .replace(/(==\/UserScript==)[\s\S]+$/, '$1')
    .replace(/^.*==\/UserScript==.*$/gm, '');
  let extraInfo = getExtraInfo(data);
  let columnWidth = 13;
  for (let [k, v] of Object.entries(extraInfo)) {
    let re = RegExp(`^//.*@${k}\\b.*$`, 'gm');
    let f_k = `@${k}`;
    f_k += Array(columnWidth - f_k.length).fill(' ').join('');
    let s = `// ${f_k} ${v}`;
    if (re.test(text)) {
      text = text.replace(re, s);
    } else {
      text += s + '\n';
    }
  }

  return text + '// ==/UserScript==';

}

const devServerConfig: DevServerConfiguration = {
  static: path.join(__dirname, 'dist'),
  port: 9000,
}

const config: webpack.Configuration = {
  entry: collectUserScripts(),
  target: 'browserslist',
  devtool: false,
  devServer: devServerConfig,
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    },
      {
        test: /\.svg$/,
        loader: 'raw-loader'
        // type: 'asset/inline'
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src')
    },
    modules: [
      'node_modules',
      'src',
    ],
    extensions: ['.ts', '.js'],
    fallback: {
      path: require.resolve('path-browserify'),
    },
  },
  optimization: {
    // We no not want to minimize our code.
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            defaults: false,
            unused: true,
          },
          mangle: false,
          format: {
            comments: false,
            beautify: true,
          },
        },
        extractComments: false,
      })],

  },
  plugins: [
    new webpack.BannerPlugin({
      banner: buildUserScriptMeta,
      entryOnly: true,
      raw: true,
      stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};

export default config;
