# Project
userscript-typescript-webpack is a starter to write simple userscripts in typescript

### Why typescript
For typescript lover. The type definitions help you to write better scripts and faster.

### Tampermonkey definition file
I choose [Tampermonkey](https://tampermonkey.net/) instead of [GreaseMonkey](https://www.greasespot.net/) as it is available in both Firefox and Chrome. Do not hesitate to modify the definition file.

It won't be difficile to use with GreaseMonkey

## How to use it
### Install
I use [Yarn](https://yarnpkg.com) for this project. It is not hard to use `npm` as well.
```shell
yarn install
```

### Code
Write your userscript inside `src/userscript-main.ts` file. Of course, you can break your code into many modules (Webpack is here for it).

### Run
@see `package.json` scripts

Build the userscript and paste the content of `dist/` to your tampermonkey script:
```shell
yarn run build
```

You can save the copy step by using another script as it will copy the output content inside your clipboard:
```shell
yarn run build-clip
```

### Debug
Browser debugging tools are enough for most cases.
