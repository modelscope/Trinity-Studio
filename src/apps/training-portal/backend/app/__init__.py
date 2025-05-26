from flask import Flask
from flask_cors import CORS
import os
import logging
from logging.handlers import TimedRotatingFileHandler
from psycopg2 import pool
from pathlib import Path
from .routes import main_blueprint
from datetime import datetime

# Get the backend root directory
BACKEND_ROOT = Path(__file__).parent.parent

# Configure logging
def setup_logging():
    log_dir = BACKEND_ROOT / 'logs'
    log_dir.mkdir(exist_ok=True)
    log_filename = log_dir / f"app.{datetime.now().strftime('%Y%m%d')}.log"
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    file_handler = TimedRotatingFileHandler(
        log_filename,
        when='midnight',
        backupCount=7,
        encoding='utf-8'
    )
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(lineno)d - %(message)s')
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)
    # Also log to console with line number
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    return root_logger

logger = setup_logging()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(main_blueprint)

    # Attach BACKEND_ROOT to app config for blueprint access
    app.config['BACKEND_ROOT'] = BACKEND_ROOT

    # Database connection pool
    db_pool = pool.SimpleConnectionPool(
        1, 10,
        user=os.getenv('PGUSER', 'postgres'),
        host=os.getenv('PGHOST', 'localhost'),
        database=os.getenv('PGDATABASE', 'postgres'),
        password=os.getenv('PGPASSWORD', 'postgres'),
        port=os.getenv('PGPORT', 5432)
    )

    def get_db_connection():
        return db_pool.getconn()

    def release_db_connection(conn):
        db_pool.putconn(conn)

    # Attach db helpers to app context for blueprint access
    app.get_db_connection = get_db_connection
    app.release_db_connection = release_db_connection

    return app

app = create_app()
