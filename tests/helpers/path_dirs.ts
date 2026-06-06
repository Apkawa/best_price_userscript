import path from "node:path";

export function projectRoot(): string {
  // // 1. Получаем путь к текущей папке, где лежит сам скрипт (аналог Path(__file__).parent)
  // const __dirname = path.dirname(new URL(import.meta.url).pathname);
  // // 2. Поднимаемся на 2 уровня вверх до корня (аналог list(Path(__file__).parents)[2])
  // const projectRoot = path.resolve(__dirname, "../..");
  // return projectRoot
  return "/home/apkawa/code/best_price_userscript";
}
