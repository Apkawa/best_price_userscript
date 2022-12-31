import webpack from 'webpack';
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import TerserPlugin from 'terser-webpack-plugin';
import {PackageJson} from 'type-fest';
import fromEntries from 'fromentries';

const packageJson: PackageJson = require('./package.json');

import sites from './src/best_price/sites';


const DOWNLOAD_SUFFIX = process.env.DOWNLOAD_SUFFIX || `/raw/master/dist/`;
const DOWNLOAD_ROOT = `${packageJson.repository}${DOWNLOAD_SUFFIX}`;

console.log(`DOWNLOAD_ROOT=${DOWNLOAD_ROOT}`);

function collectUserScripts() {
  const root = path.resolve(__dirname, 'src');
  return fromEntries(glob.sync(root + '/**/*.user.[tj]s').map(f => {
    const relPath = path.relative(root, f);
    const bName = path.basename(path.basename(relPath, '.js'), '.ts');
    const name = `${path.dirname(relPath)}/${bName}`;
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
  const match: string[] = [];
  for (const site of sites) {
    match.push(`https://${site.domain}/*`);
    match.push(`https://www.${site.domain}/*`);
  }

  return {
    author,
    homepage,
    homepageUrl: homepage,
    supportUrl,
    downloadUrl,
    updateUrl: downloadUrl,
    license: packageJson.license,
    version: packageJson.version,
    match,
  };
}

type BannerDataType = {hash: string; chunk: webpack.Chunk; filename: string}

function buildUserScriptMeta(data: BannerDataType) {
  let src_path = path.resolve(__dirname, `src/${data.chunk.name}.ts`);
  if (!fs.existsSync(src_path)) {
    src_path = path.resolve(__dirname, `src/${data.chunk.name}.js`);
  }
  let text = fs.readFileSync(src_path, 'utf-8')
    .replace(/(==\/UserScript==)[\s\S]+$/, '$1')
    .replace(/^.*==\/UserScript==.*$/gm, '');
  const extraInfo = getExtraInfo(data);
  const columnWidth = 13;
  for (const [k, v] of Object.entries(extraInfo)) {
    let item_val: string[];
    if (typeof v === 'string') {
      item_val = [v];
    } else {
      item_val = v;
    }
    const re = RegExp(`^//.*@${k}\\b.*$`, 'gm');
    let f_k = `@${k}`;
    f_k += Array(columnWidth - f_k.length).fill(' ').join('');
    let s = '';
    let i = 0;
    for (const _v of item_val) {
      if (i > 0) {
        s += '\n';
      }
      s += `// ${f_k} ${_v}`;
      i++;
    }
    if (re.test(text)) {
      text = text.replace(re, s);
    } else {
      text += s + '\n';
    }
  }

  return text + '// ==/UserScript==';

}

const config: webpack.Configuration = {
  entry: collectUserScripts(),
  target: 'browserslist',
  devtool: false,
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: require.resolve('./tsconfig-ts-loader.json'),
        },
      },
    },
      {
        test: /\.svg$/,
        loader: 'raw-loader',
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
      'app': path.resolve(__dirname, 'src'),
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
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};

export default config;
