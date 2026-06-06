import net from "node:net";

/**
 * Проверяет, доступен ли порт (ожидание подключения к CDP).
 */
export async function waitForPort(port: number, timeout: number = 30000): Promise<void> {
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

export async function waitForCDPReady(port: number, timeout: number = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) {
        console.log(`[RTFoxManager] CDP is ready on port ${port}`);
        return;
      }
    } catch {
      // Will retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`CDP not ready on port ${port} after ${timeout}ms`);
}
