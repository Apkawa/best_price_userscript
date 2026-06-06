# /// script
# dependencies = [
#     "rtfox-browser",
# ]
# ///
from pathlib import Path
import sys
import os
import time

# это форк undetected-chromedriver
import rtfox_browser as uc

project_root = list(Path(__file__).parents)[2]

profile_path = (project_root / Path('test-tools/__rtfox_profile')).absolute()

# Запускаем браузер, привязав его к этой папке
driver = uc.Chrome(
  user_data_dir=profile_path,
)
try:
  driver.get("https://www.ozon.ru/")
  time.sleep(100000)
finally:
  driver.quit()
  sys.exit(1)
