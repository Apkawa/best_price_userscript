import { type ChildProcess, spawn } from "node:child_process";
import { chromium, type Browser } from "playwright";
import { waitProcessReady } from "./process"; // ваш хелпер
import { waitForCDPReady, waitForPort } from "./network"; // ваш хелпер
import { projectRoot } from "./path_dirs";
import path from "node:path";

const RTFOX_SCRIPT = path.resolve(projectRoot(), "test-tools/rtfox-browser.py");
const PROFILE_DIR = path.resolve(projectRoot(), "test-tools/profiles/__rtfox_profile");

export interface RTFoxOptions {
  port?: number;
  profileDir?: string;
  pythonScriptPath?: string;
}

export class RTFoxManager {
  private process: ChildProcess | null = null;
  private browser: Browser | null = null;
  private port: number;
  private profileDir: string;
  private scriptPath: string;

  constructor(options: RTFoxOptions) {
    this.port = options.port ?? 9222;
    this.profileDir = options.profileDir ?? PROFILE_DIR;
    this.scriptPath = options.pythonScriptPath ?? RTFOX_SCRIPT;
  }

  /**
   * Запускает Python-скрипт и подключается к браузеру через CDP.
   * Возвращает инстанс Playwright Browser.
   */
  async start(): Promise<Browser> {
    const processCall = () =>
      spawn(
        "uv",
        [
          "run",
          "--with",
          "rtfox-browser",
          this.scriptPath,
          "--port",
          String(this.port),
          "--profile",
          this.profileDir,
        ],
        {
          stdio: ["ignore", "pipe", "pipe"],
          detached: false,
        },
      );

    // Ждем текстовый маркер из Python
    this.process = await waitProcessReady(processCall, {
      stdout: "RTFox browser is ready on",
    });

    // Дополнительно ждем доступности сетевого порта
    await waitForPort(this.port, 30 * 1000);
    await waitForCDPReady(this.port, 30 * 1000);
    console.log(`[RTFoxManager] Ready for connection on port ${this.port}`);

    // Подключаемся
    this.browser = await chromium.connectOverCDP(`http://127.0.0.1:${this.port}`);
    return this.browser;
  }

  /**
   * Чистит за собой всё: закрывает CDP-соединение и корректно тушит Python-процесс.
   */
  async stop(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }

    if (this.process && !this.process.killed) {
      const proc = this.process;
      proc.kill("SIGTERM");

      // Даем время на graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!proc.killed) {
        proc.kill("SIGKILL");
      }

      await new Promise<void>((resolve) => {
        proc.on("exit", () => resolve());
        setTimeout(resolve, 2000); // Предохранитель
      });

      this.process = null;
    }
  }

  /** Полезные геттеры для внешнего использования */
  get debugPort(): number {
    return this.port;
  }
  get activeProcess(): ChildProcess | null {
    return this.process;
  }
}
