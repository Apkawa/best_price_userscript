Сборка базируется на [userscript-typescript-webpack](https://github.com/vannhi/userscript-typescript-webpack) плюс доработки

## Стек технологий

* typescript
* webpack
* eslint
* jest
* puppeteer

## Установка

### Tampermonkey

1. git clone
2. `npm i`
3. `npm run build:watch`
4. Включить для Tampermonkey доступ к локальным урлам
5. Добавить в Tampermonkey содержимое `./debug.js` отредактиров @require на актуальный путь скрипта из `./dist`

### Greasemonkey

1. git clone
2. `npm i`
3. `npm run build:serve`
5. Добавить в Greasemonkey содержимое `./debug.js`
5. Убедиться что `@require` содержит `http://localhost:9000/best_price/best_price.user.js`
6. При изменениях добавлять к урлу get параметр с ревизией (@require сильно кешируется) https://github.com/Tampermonkey/tampermonkey/issues/723

## Версии

```
npm version [patch|minor|major]
```

https://docs.npmjs.com/about-semantic-versioning

- `patch` - багфиксы
- `minor` - добавляем новый сайт или фичу
- `major` - когда ломаем все


## Тесты

`npm run test` - запуск юнит тестов

### Порядок обновления снапшотов для тестов

1) 
    * в папке `tests/jsdom/snapshots` удалить определенный снапшот или все снапшоты
    * или в `tests/jsdom/jsdom_snapshot.ts`  `JSDOM_SNAPSHOT_CONF` добавить флаг `replace` `true`  
2) запустить обновление снапшота `npm run test:jsdom:snapshot-sync`




