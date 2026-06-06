import { ChildProcessByStdio, StdioNull, StdioPipe } from "node:child_process";
import { Readable } from "node:stream";
import { isFunction } from "rxjs/internal-compatibility";

type ProcessType = ChildProcessByStdio<null, Readable, Readable>;
type SpawnFunc = () => ProcessType;
type StdTestFunc = (line: string) => boolean;

interface WaitReadyOpts {
  stdout?: StdTestFunc | string;
  // stderr?: StdTestFunc | string,
  timeout?: number;
}

export function waitProcessReady(spawn: SpawnFunc, opts: WaitReadyOpts): Promise<ProcessType> {
  const { stdout, timeout = 30 * 1000 } = opts;
  return new Promise<ProcessType>((resolve, reject) => {
    // Запускаем Python скрипт rtfox.py
    const rtfoxProcess = spawn();

    // Ставим жесткий тайм-аут на 30 секунд
    const timeoutIdx = setTimeout(() => {
      cleanup();
      reject(new Error("Превышено время ожидания запуска RTFox браузера (30 секунд)"));
    }, timeout);
    //
    // Функция очистки слушателей, чтобы не было утечек памяти
    const cleanup = () => {
      clearTimeout(timeoutIdx);
      rtfoxProcess.stderr?.off("data", onData);
      rtfoxProcess.stdout?.off("data", onData);
    };
    // Функция для проверки каждой порции данных из stdout
    const onData = (data: Buffer) => {
      const text = data.toString();
      let success = false;
      if (stdout) {
        if (typeof stdout === "string" && text.includes(stdout)) {
          success = true;
        }
        if (isFunction(stdout) && stdout(text)) {
          success = true;
        }
      }
      if (success) {
        cleanup();
        resolve(rtfoxProcess);
      }
    };
    rtfoxProcess.stdout?.on("data", onData);

    let stderrOutput = "";
    rtfoxProcess.stderr?.on("data", (data: Buffer) => {
      stderrOutput += data.toString();
      process.stderr.write(data);
    });

    let stdoutOutput = "";
    rtfoxProcess.stdout?.on("data", (data: Buffer) => {
      stdoutOutput += data.toString();
      process.stdout.write(data);
    });
  });
}
