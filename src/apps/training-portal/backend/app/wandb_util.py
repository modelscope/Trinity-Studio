from wandb import Api
from dotenv import load_dotenv
import os
from pathlib import Path
import logging
logger = logging.getLogger(__name__)

def get_wandb_api():
    dotenv_path = Path(__file__).resolve().parents[4] / 'configs' / '.env'
    load_dotenv(dotenv_path=dotenv_path)
    logger.debug("dotenv_path: %s", dotenv_path)
    logger.debug("WANDB_API_KEY: %s", os.getenv('WANDB_API_KEY'))
    logger.debug("WANDB_ENTITY: %s", os.getenv('WANDB_ENTITY'))
    logger.debug("WANDB_BASE_URL: %s", os.getenv('WANDB_BASE_URL'))
    return Api()

def safe_to_dict(obj):
    logger.debug(f"safe_to_dict called with type: {type(obj)}")
    try:
        to_dict = object.__getattribute__(obj, "to_dict")
        if callable(to_dict):
            try:
                return to_dict()
            except Exception as e:
                logger.error(f"Error calling to_dict: {e}")
    except AttributeError:
        pass
    try:
        return dict(obj)
    except Exception as e:
        logger.error(f"Error converting to dict: {e}")
    items = getattr(obj, "items", None)
    if callable(items):
        try:
            return dict(items())
        except Exception as e:
            logger.error(f"Error converting items() to dict: {e}")
    return {}

def deep_safe_to_dict(obj):
    # Try to use to_dict() if available, but never use hasattr/getattr
    try:
        to_dict = object.__getattribute__(obj, "to_dict")
        if callable(to_dict):
            try:
                return to_dict()
            except Exception:
                pass
    except Exception:
        pass
    # Try to convert to dict via items() if available
    try:
        items = object.__getattribute__(obj, "items")
        if callable(items):
            try:
                return {k: deep_safe_to_dict(v) for k, v in items()}
            except Exception:
                pass
    except Exception:
        pass
    # Try to convert to dict directly
    try:
        return {k: deep_safe_to_dict(v) for k, v in dict(obj).items()}
    except Exception:
        pass
    # Handle lists/tuples
    if isinstance(obj, (list, tuple)):
        return [deep_safe_to_dict(v) for v in obj]
    # Primitives
    if isinstance(obj, (str, int, float, bool, type(None))):
        return obj
    # Fallback: string
    return str(obj)

def extract_project_summary(project):
    return {
        'id': getattr(project, 'id', None),
        'name': getattr(project, 'name', None),
        'entity': getattr(project, 'entity', None),
    }

def extract_project_details(project):
    return {
        'id': getattr(project, 'id', None),
        'name': getattr(project, 'name', None),
        'entity': getattr(project, 'entity', None),
        'description': getattr(project, 'description', None),
        'created_at': getattr(project, 'created_at', None),
        'updated_at': getattr(project, 'updated_at', None),
        'url': getattr(project, 'url', None),
        'state': getattr(project, 'state', None),
        'sweep_count': getattr(project, 'sweep_count', None),
        'run_count': getattr(project, 'run_count', None),
        'artifact_count': getattr(project, 'artifact_count', None),
        'last_run': getattr(project, 'last_run', None),
        'tags': list(getattr(project, 'tags', [])),
        'team': getattr(project, 'team', None),
        'access': getattr(project, 'access', None),
    }

def extract_run_summary(run):
    return {
        'id': getattr(run, 'id', None),
        'name': getattr(run, 'name', None),
        'state': getattr(run, 'state', None),
    }

def extract_run_details(run):
    return {
        'id': getattr(run, 'id', None),
        'name': getattr(run, 'name', None),
        'state': getattr(run, 'state', None),
        'tags': list(getattr(run, 'tags', [])),
        'description': getattr(run, 'description', None),
        'privacy': getattr(run, 'privacy', None),
        'author': getattr(run, 'entity', None),
        'created_at': getattr(run, 'created_at', None),
        'updated_at': getattr(run, 'updated_at', None),
        'duration': getattr(run, 'duration', None),
        'run_path': getattr(run, 'path', None),
        'hostname': getattr(run, 'host', None),
        'os': getattr(run, 'os', None),
        'python_version': getattr(run, 'python', None),
        'python_executable': getattr(run, 'python_executable', None),
        'command': getattr(run, 'command', None),
        'group': getattr(run, 'group', None),
        'config': deep_safe_to_dict(getattr(run, 'config', {})),
        'summary': deep_safe_to_dict(getattr(run, 'summary', {})),
        'metadata': deep_safe_to_dict(getattr(run, 'metadata', {})),
        'heartbeatAt': getattr(run, 'heartbeatAt', None),
        'startedAt': getattr(run, 'startedAt', None),
        'cpu_count': getattr(run, 'cpu_count', None),
        'gpu': getattr(run, 'gpu', None),
        'gpu_count': getattr(run, 'gpu_count', None),
        'executable': getattr(run, 'executable', None),
        'username': getattr(run, 'username', None),
    }

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(lineno)d - %(message)s'
    )

    api = get_wandb_api()
    projects = api.projects(entity="dail", per_page=5)
    logger.info("Project summary: %s", extract_project_summary(projects[0]))
    logger.info("Project details: %s", extract_project_details(projects[0]))

    runs = api.runs(path="dail/direct-preference-optimization", per_page=5)
    logger.info("Run summary: %s", extract_run_summary(runs[0]))
    logger.info("Run details: %s", extract_run_details(runs[0]))