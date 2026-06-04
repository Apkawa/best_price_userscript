import { Glob } from "bun";
import fs from "node:fs";
import path from "node:path";
import { buildUserScriptMeta, getUserscriptDebugLink } from "./utils";

const projectRoot = path.resolve(path.dirname(import.meta.dir));
const srcRoot = path.resolve(projectRoot, "src");

const isWatchMode = !!process.env.WATCH;

async function buildAll() {
  // 1. Находим все юзерскрипты
  const glob = new Glob("src/**/*.user.{ts,js}");

  // Функция для генерации баннера (можно импортировать из вашего существующего модуля)

  console.log(srcRoot);
  console.log("🚀 Начинаю сборку...");

  for (const file of glob.scanSync(".")) {
    const fullPath = path.resolve(file);
    const relPath = path.relative(srcRoot, fullPath);

    // Определяем имя выходного файла (сохраняя структуру папок)
    const outName = relPath.replace(/\.[tj]s$/, ".js");

    const tsFile = path.join(path.dirname(fullPath), path.basename(outName, ".js") + ".js");
    // console.log(file, tsFile);
    if (file.endsWith(".js") && fs.existsSync(tsFile)) {
      console.log(`SKIP ${relPath}, ts файл с таким же именем существует.`);
      continue;
    }

    const outPath = `./dist/${outName}`;

    // 2. Собираем каждый скрипт отдельно
    const result = await Bun.build({
      entrypoints: [fullPath],
      minify: false, // для юзерскриптов обычно лучше false или true с осторожностью
      // Если нужны внешние либы: external: ['jquery'],
    });

    if (result.success) {
      const buildOutput = await result.outputs[0].text();
      const banner = buildUserScriptMeta(fullPath);

      // 3. Записываем файл с баннером
      await Bun.write(outPath, banner + "\n" + buildOutput);
      console.log(`✅ Собрано: ${outPath}`);
      console.log(`🔗 Добавляем в debug.js
// @require ${getUserscriptDebugLink(outPath)}`);
    } else {
      console.error(`❌ Ошибка в ${file}:`, result.logs);
    }
  }
}

if (isWatchMode) {
  fs.watch(srcRoot, { recursive: true }, (event, filename) => {
    if (filename?.endsWith(".ts") || filename?.endsWith(".js")) {
      console.log(`\n🔄 Файл ${filename} изменен...`);
      buildAll();
    }
  });
}

buildAll();
//
