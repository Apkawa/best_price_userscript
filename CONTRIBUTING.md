Базируется на [userscript-typescript-webpack](https://github.com/vannhi/userscript-typescript-webpack) плюс доработка сборки

Все исходники на typescript

## Установка

1. git clone
2. `npm i`
3. `npm run build:watch`
4. Включить для Tampermonkey доступ к локальным урлам
5. Добавить в Tampermonkey содержимое `./debug.js` отредактиров @require на актуальный путь скрипта из `./dist`


