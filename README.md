# Коллекция юзерскриптов

## Юзерскрипты

### Актуальные скрипты

* [best_price](src/best_price) - поиск лучшей цены
* [pikabu.ru/enchanted.user.ts](src/pikabu.ru/enchanted.user.ts) - улучшения пикабу, 
  * возвращение кнопки сохранить
  * перенос поля комментирования вверх чтобы удобнее сразу писать комментарий для комментируемых постов
* [pikabu.ru/video_url.user.ts](src/pikabu.ru/video_url.user.ts) - добавление ссылки на скачивание [mp4] и [gif], в пикабу видео по умолчанию в формате webm, телеграм такое не переваривает


### Заброшенные

* `src/hd.kinopoisk.ru/kp_subtitle_petition.user.ts` - для петиций по добавлению в КП субтитров и оригинальной озвучки. Давно не обновлялось, уже не работает
* [pikabu.ru/hide_watermark.user.ts](src/pikabu.ru/hide_watermark.user.ts) - скрытие ватермарки. вместо этого удобнее юзать правило в uBlock ` pikabu.ru##img[data-watermarked='1']`
* [ozon.ru/best_price_calculator.user.ts](src/ozon.ru/best_price_calculator.user.ts) -  неактуальное, см [best_price](src/best_price)

## Установка

1. Установите [Tampermonkey](https://www.tampermonkey.net/) (GreaseMonkey не тестировался, не уверен что работает)
2. Откройте https://github.com/Apkawa/userscripts/tree/master/dist выберите файл скрипта *.user.js
3. Нажмите кнопку `raw`
4. Предложат установить юзерскрипт, соглашайтесь


## Самостоятельная сборка

По вопросам самостоятельной сборки и доработок см в [CONTRIBUTING](./CONTRIBUTING.md)

