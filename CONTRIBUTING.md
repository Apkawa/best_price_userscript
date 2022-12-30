Сборка базируется на [userscript-typescript-webpack](https://github.com/vannhi/userscript-typescript-webpack) плюс доработки

## Стек технологий

* typescript
* webpack
* eslint
* jest
* puppeteer

## Установка

1. git clone
2. `npm i`
3. `npm run build:watch`
4. Включить для Tampermonkey доступ к локальным урлам
5. Добавить в Tampermonkey содержимое `./debug.js` отредактиров @require на актуальный путь скрипта из `./dist`

## Именование коммитов

Подключен [commitlint](https://github.com/conventional-changelog/commitlint/#what-is-commitlint)

[Немного справки из хабра](https://habr.com/ru/company/yandex/blog/431432/)

- `build` 	Сборка проекта или изменения внешних зависимостей
- `ci` 	Настройка CI и работа со скриптами
- `docs` 	Обновление документации
- `feat` 	Добавление нового функционала
- `fix` 	Исправление ошибок
- `perf` 	Изменения направленные на улучшение производительности
- `refactor` 	Правки кода без исправления ошибок или добавления новых функций
- `revert` 	Откат на предыдущие коммиты
- `style` 	Правки по кодстайлу (табы, отступы, точки, запятые и т.д.)
- `test` 	Добавление тестов

Для корректного написания текста коммита, вызовите команду `git cz` или `npm run commit` и ответьте на вопросы


## Версии

```
npm version [patch|minor|major]
```

https://docs.npmjs.com/about-semantic-versioning

- `patch` - багфиксы
- `minor` - добавляем новый сайт или фичу
- `major` - когда ломаем все

