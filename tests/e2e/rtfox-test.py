# /// script
# dependencies = [
#     "rtfox-browser",
# ]
# ///
from pathlib import Path
import sys
import os
import time
import signal
import argparse

# это форк undetected-chromedriver
import rtfox_browser as uc

def main():
    parser = argparse.ArgumentParser(description="RTFox Browser E2E Driver")
    parser.add_argument(
        "--port", type=int, default=9222,
        help="Remote debugging port (default: 9222)"
    )
    parser.add_argument(
        "--profile", type=str, default=None,
        help="Path to user data directory"
    )
    args = parser.parse_args()

    project_root = list(Path(__file__).parents)[2]
    profile_path = Path(args.profile) if args.profile else (project_root / Path('test-tools/__rtfox_profile')).absolute()

    # Настройка опций Chrome для включения remote debugging
    options = uc.ChromeOptions()
    options.add_argument(f'--remote-debugging-port={args.port}')

        # Запускаем браузер, привязав его к этой папке
    driver = uc.Chrome(
        user_data_dir=str(profile_path),
        options=options,
    )
    print(f"RTFox browser is ready on port {args.port}", flush=True)
    print("Press Ctrl+C to exit...", flush=True)

    # Обработчик для graceful shutdown
    def signal_handler(sig, frame):
        print("\nShutting down...", flush=True)
        driver.quit()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Ждём завершения процесса (Ctrl+C)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
          signal_handler(None, None)

if __name__ == "__main__":
    main()
