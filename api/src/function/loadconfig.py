from concurrent.futures import ThreadPoolExecutor
from dotenv import dotenv_values
import os

# load config
config = {**dotenv_values("config/.env"), **os.environ}

# Unescape literal \n if passed via environment variables
for key in ("PRIKEY", "PUBKEY"):
    if key in config and isinstance(config[key], str) and "\\n" in config[key]:
        config[key] = config[key].replace("\\n", "\n")

UPLOAD_FOLDER = os.path.join('files', 'UploadFile')

isDev = config.get('DEV', 'false').lower() == "true"

executor = ThreadPoolExecutor(max_workers=1)