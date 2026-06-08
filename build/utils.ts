import path from "node:path";
import fs from "node:fs";
import type { PackageJson } from "type-fest";

const packageJson: PackageJson = require("../package.json");

export interface GetExtraInfoOpts {
  downloadSuffix?: string;
}

export function getExtraInfo(srcPath: string, opts: GetExtraInfoOpts = {}) {
  const { downloadSuffix = `${packageJson.repository}/raw/master/dist/` } = opts;
  const name = path.basename(srcPath, ".ts");
  const homepage = packageJson.homepage;
  let supportUrl = packageJson.bugs;
  if (typeof supportUrl !== "string") {
    supportUrl = supportUrl?.url;
  }
  const downloadUrl = `${downloadSuffix}${name}.js`;
  let author = packageJson.author;
  if (typeof author !== "string") {
    author = author?.name;
  }

  const bannerMeta = {
    author,
    homepage,
    homepageURL: homepage,
    supportURL: supportUrl,
    downloadURL: downloadUrl,
    updateURL: downloadUrl,
    license: packageJson.license,
  };
  return bannerMeta;
}

export interface BannerMeta {
  [key: string]: string;
}

export interface BuildUserScriptMetaOpts {
  bannerMetaOverride?: BannerMeta;
  downloadSuffix?: string;
}

export function buildUserScriptMeta(src_path: string, opts: BuildUserScriptMetaOpts = {}) {
  const { bannerMetaOverride, downloadSuffix } = opts;

  let text = fs
    .readFileSync(src_path, "utf-8")
    .replace(/(==\/UserScript==)[\s\S]+$/, "$1")
    .replace(/^.*==\/UserScript==.*$/gm, "");
  const extraInfo = getExtraInfo(src_path, { downloadSuffix });

  // console.log(extraInfo);
  const columnWidth = 13;
  for (const [k, v] of Object.entries({ ...extraInfo, ...bannerMetaOverride })) {
    const re = RegExp(`^//.*@${k}\\b.*$`, "gm");
    let f_k = `@${k}`;
    f_k += Array(columnWidth - f_k.length)
      .fill(" ")
      .join("");
    const s = `// ${f_k} ${v}`;
    if (re.test(text)) {
      text = text.replace(re, s);
    } else {
      text += s + "\n";
    }
  }

  return text + "// ==/UserScript==";
}

export function getUserscriptDebugLink(linuxPath: string) {
  const distro = process.env.WSL_DISTRO_NAME;

  if (!distro) {
    // Если мы не в WSL, возвращаем обычный путь
    return `file://${path.resolve(linuxPath)}`;
  }

  // Превращаем абсолютный путь Linux в путь WSL
  const fullLinuxPath = path.resolve(linuxPath);

  // Формируем ссылку для Windows
  // Важно: Windows ожидает обратные слеши в сетевых путях
  const winPath = fullLinuxPath.replace(/\//g, "\\");

  return `file://wsl$/${distro}${winPath}`;
}
