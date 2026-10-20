"""PythonAnywhere WSGI configuration.

Setup (see README → Deploying the backend on PythonAnywhere):

1. Upload/clone this project to /home/USERNAME/Portfolio. Only the backend and
   its dependencies are needed on PythonAnywhere — the React app is built and
   served by Vercel.
2. Create a virtualenv and install backend/requirements.txt into it.
3. In the Web tab, open the WSGI configuration file, replace its contents with
   this file, and point PROJECT_DIR at your project folder.
4. Reload the web app.

Environment variables (SECRET_KEY, ADMIN_PASSWORD_HASH, PUBLIC_BASE_URL, ...)
are read from the project's .env file by create_app(); nothing secret belongs in
this file.
"""

import os
import sys

PROJECT_DIR = '/home/YOURUSERNAME/Portfolio'

if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from dotenv import load_dotenv  # noqa: E402  (path must be set before importing backend)

load_dotenv(os.path.join(PROJECT_DIR, '.env'))

from backend import create_app  # noqa: E402

application = create_app()
