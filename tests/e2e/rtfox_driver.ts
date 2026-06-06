import { test as baseTest } from "@playwright/test";
import { chromium } from "playwright";
import { ChildProcess, spawn } from "node:child_process";
import net from "node:net";

/**
 * Проверяет, доступен ли порт (ожидание подключения к CDP).
 */
async function waitForPort(port: number, timeout: number = 30000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for port ${port} after ${timeout}ms`));
    }, timeout);

    const check = () => {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.on("connect", () => {
        socket.destroy();
        clearTimeout(timer);
        resolve();
      });
      socket.on("error", () => {
        // Port not available yet, retry
        if (Date.now() - start < timeout) {
          setTimeout(check, 500);
        } else {
          clearTimeout(timer);
          reject(new Error(`Timeout waiting for port ${port}`));
        }
      });
      socket.on("timeout", () => {
        socket.destroy();
        setTimeout(check, 500);
      });
      socket.connect(port, "127.0.0.1");
    };
    check();
  });
}

/**
 * Интерфейс для тестового контекста с браузером RTFox.
 */
interface RTFoxContext {
  /** Подключённый браузер через CDP */
  browser: ReturnType<typeof chromium.connectOverCDP>;
  /** Процесс Python скрипта rtfox.py */
  rtfoxProcess: ChildProcess;
  /** Порт отладки */
  debugPort: number;
}

// Расширяем стандартный тип тест-контекста Playwright
export const test = baseTest.extend<RTFoxContext>({
  browser: async ({}, use) => {
    const port = 9222;
    const profileDir = "/home/apkawa/code/best_price_userscript/test-tools/__rtfox_profile";

    // Запускаем Python скрипт rtfox.py
    const rtfoxProcess = spawn(
      "uv",
      ["run", "tests/e2e/rtfox-test.py", "--port", String(port), "--profile", profileDir],
      {
        stdio: ["ignore", "pipe", "pipe"],
        detached: false,
      },
    );

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

    // Ждём пока браузер запустится и порт станет доступен
    await waitForPort(port, 10 * 1000);
    console.log(`node-test RTFox ready connection on port ${port}`);
    // Подключаемся к браузеру через CDP
    const browser = await chromium.connectOverCDP(`http://localhost:${port}`);

    try {
      // Передаём браузер дальше в тесты Playwright
      await use(browser);
    } finally {
      // Отключаемся от браузера (не закрывая сам браузер)
      await browser.close().catch(() => {});

      // Завершаем процесс Python скрипта
      rtfoxProcess.kill("SIGTERM");
      // Даем время на graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Если процесс всё ещё жив, убиваем принудительно
      if (!rtfoxProcess.killed) {
        rtfoxProcess.kill("SIGKILL");
      }

      // Ждём завершения процесса
      await new Promise((resolve) => {
        rtfoxProcess.on("exit", resolve);
        setTimeout(resolve, 2000);
      });

      console.log(`RTFox process terminated. Stdout: ${stdoutOutput}`);
      if (stderrOutput.trim()) {
        console.error(`RTFox process stderr: ${stderrOutput}`);
      }
    }
  },

  // Автоматически создаём context и page для подключённого браузера
  context: async ({ browser }, use) => {
    // При подключении через CDP создаём новый контекст
    const context = browser.contexts()[0];
    await use(context);
    await context.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from "@playwright/test";
