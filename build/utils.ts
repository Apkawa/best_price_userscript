import path from "path";
import fs from "fs";
import { PackageJson } from "type-fest";

const packageJson: PackageJson = require("../package.json");

export function getExtraInfo(srcPath: string) {
  const name = path.basename(srcPath, ".ts");
  let homepage = packageJson.homepage;
  let supportUrl = packageJson.bugs;
  if (typeof supportUrl !== "string") {
    supportUrl = supportUrl?.url;
  }
  let downloadUrl = `${packageJson.repository}/raw/master/dist/${name}.js`;
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

export function buildUserScriptMeta(src_path: string) {
  let text = fs
    .readFileSync(src_path, "utf-8")
    .replace(/(==\/UserScript==)[\s\S]+$/, "$1")
    .replace(/^.*==\/UserScript==.*$/gm, "");
  let extraInfo = getExtraInfo(src_path);
  // console.log(extraInfo);
  let columnWidth = 13;
  for (let [k, v] of Object.entries(extraInfo)) {
    let re = RegExp(`^//.*@${k}\\b.*$`, "gm");
    let f_k = `@${k}`;
    f_k += Array(columnWidth - f_k.length)
      .fill(" ")
      .join("");
    let s = `// ${f_k} ${v}`;
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
