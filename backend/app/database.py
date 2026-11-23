from pymongo import MongoClient
from pymongo.database import Database
import logging
from app.config import settings

logger = logging.getLogger(__name__)

client: MongoClient = None
db: Database = None

def get_database() -> Database:
    global client, db
    if db is None:
        try:
            client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
            db = client[settings.DATABASE_NAME]
            # Ensure indexes on datasets collection
            db.datasets.create_index("dataset_id", unique=True)
            db.datasets.create_index("created_at")
            db.datasets.create_index("scenario_type")
            # Ensure indexes on generation_jobs collection
            db.generation_jobs.create_index("job_id", unique=True)
            db.generation_jobs.create_index("dataset_id")
            db.generation_jobs.create_index("started_at")
            logger.info("Connected to MongoDB: %s", settings.DATABASE_NAME)
        except Exception as e:
            logger.error("Failed to connect to MongoDB: %s", e)
            raise e
    return db

def check_db_health() -> bool:
    try:
        database = get_database()
        database.command("ping")
        return True
    except Exception as e:
        logger.warning("MongoDB ping failed: %s", e)
        return False
