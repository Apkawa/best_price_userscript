# /// script
# dependencies = [
#     "rtfox-browser",
# ]
# ///
import sys
import os
import time

import rtfox_browser as uc

profile_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '__rtfox_profile'))

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
