from flask import Blueprint, jsonify, request, send_from_directory, current_app
import os
from functools import wraps
from datetime import datetime
import logging
from .wandb_util import get_wandb_api, extract_run_details, extract_project_summary, extract_run_summary, extract_project_details
logger = logging.getLogger(__name__)

main_blueprint = Blueprint('main', __name__)

# Database connection helpers will be attached to app context in __init__.py

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('Authorization')
        current_app.logger.info(f"API key: {api_key}")
        if not api_key or not api_key.startswith('Bearer '):
            current_app.logger.warning(f"Unauthorized access attempt to {request.path}")
            return jsonify({'error': 'API key required'}), 401
        return f(*args, **kwargs)
    return decorated

@main_blueprint.before_app_request
def log_request_info():
    current_app.logger.info(f"Request: {request.method} {request.path} - IP: {request.remote_addr}")
    if request.is_json:
        current_app.logger.debug(f"Request body: {request.get_json()}")

@main_blueprint.after_app_request
def log_response_info(response):
    current_app.logger.info(f"Response: {response.status} for {request.method} {request.path}")
    return response

@main_blueprint.route('/api/health')
def health_check():
    try:
        conn = current_app.get_db_connection()
        with conn.cursor() as cur:
            cur.execute('SELECT NOW()')
        current_app.release_db_connection(conn)
        current_app.logger.info("Health check successful")
        return jsonify({
            'status': 'ok',
            'database': 'connected',
            'wandb_configured': bool(os.getenv('WANDB_API_KEY'))
        })
    except Exception as e:
        current_app.logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@main_blueprint.route('/api/wandb/projects')
def list_projects():
    try:
        query = request.args.get('q', '').lower()
        current_app.logger.info(f"Fetching projects with query: {query}")

        api = get_wandb_api()
        projects = api.projects(entity=os.getenv("WANDB_ENTITY", "dail"))
        formatted_projects = [
            extract_project_summary(p)
            for p in projects
            if not query or query in p.name.lower() or query in p.entity.lower()
        ]
        current_app.logger.info(f"Found {len(formatted_projects)} projects")
        return jsonify(formatted_projects)
    except Exception as e:
        current_app.logger.error(f"Error listing projects: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/api/wandb/projects/<project>/runs')
def list_runs(project):
    try:
        query = request.args.get('q', '').lower()
        current_app.logger.info(f"Fetching runs for project {project} with query: {query}")
        api = get_wandb_api()
        runs = api.runs(path=f"dail/{project}", per_page=50)
        formatted_runs = [
            extract_run_summary(run)
            for run in runs
            if not query or query in run.name.lower() or query in run.id.lower()
        ]
        current_app.logger.info(f"Found {len(formatted_runs)} runs")
        return jsonify(formatted_runs)
    except Exception as e:
        current_app.logger.error(f"Error listing runs: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/api/wandb/runs/<project>/<run_id>')
def get_run(project, run_id):
    try:
        current_app.logger.info(f"Fetching run {run_id} from project {project}")

        api = get_wandb_api()
        run = api.run(f"{project}/{run_id}")

        # Print and extract all run details
        payload = extract_run_details(run)

        return jsonify(payload)
    except Exception as e:
        current_app.logger.error(f"Error fetching run data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/api/recipes', methods=['GET'])
def get_recipes():
    try:
        current_app.logger.info("Fetching all recipes")
        config_dir = current_app.config['BACKEND_ROOT'] / 'configs'
        config_dir.mkdir(exist_ok=True)
        recipes = []
        for file_path in config_dir.glob('*.yaml'):
            with open(file_path, 'r') as f:
                content = f.read()
                recipes.append({
                    'id': file_path.stem,
                    'name': file_path.stem,
                    'content': content
                })
        current_app.logger.info(f"Found {len(recipes)} recipes")
        return jsonify(recipes)
    except Exception as e:
        current_app.logger.error(f"Error reading recipes: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/api/recipes', methods=['POST'])
def create_recipe():
    try:
        data = request.json
        name = data.get('name')
        content = data.get('content')
        if not name or not content:
            current_app.logger.warning("Recipe creation failed: missing name or content")
            return jsonify({'error': 'Name and content are required'}), 400
        current_app.logger.info(f"Creating recipe: {name}")
        config_dir = current_app.config['BACKEND_ROOT'] / 'configs'
        config_dir.mkdir(exist_ok=True)
        file_path = config_dir / f"{name}.yaml"
        overwrite = data.get('overwrite', False)
        if file_path.exists():
            if not overwrite:
                current_app.logger.warning(f"Recipe already exists: {name}")
                return jsonify({'error': 'Recipe already exists'}), 400
            else:
                current_app.logger.info(f"Overwriting existing recipe: {name}")
        with open(file_path, 'w') as f:
            f.write(content)
        current_app.logger.info(f"Successfully created recipe: {name}")
        return jsonify({
            'id': name,
            'name': name,
            'content': content
        }), 201
    except Exception as e:
        current_app.logger.error(f"Error creating recipe: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/api/recipes/<recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    try:
        current_app.logger.info(f"Deleting recipe: {recipe_id}")
        file_path = current_app.config['BACKEND_ROOT'] / 'configs' / f"{recipe_id}.yaml"
        if not file_path.exists():
            current_app.logger.warning(f"Recipe not found: {recipe_id}")
            return jsonify({'error': 'Recipe not found'}), 404
        file_path.unlink()
        current_app.logger.info(f"Successfully deleted recipe: {recipe_id}")
        return '', 204
    except Exception as e:
        current_app.logger.error(f"Error deleting recipe: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/api/jobs/start', methods=['POST'])
def start_job():
    try:
        data = request.json
        recipe = data.get('recipe')
        job_type = data.get('type')
        if not recipe or not job_type:
            current_app.logger.warning("Job start failed: missing recipe or type")
            return jsonify({'error': 'Recipe and type are required'}), 400
        current_app.logger.info(f"Starting job: {job_type} with recipe {recipe}")
        job_id = f"{job_type}_{recipe}_{datetime.now().isoformat()}"
        current_app.logger.info(f"Job started successfully: {job_id}")
        return jsonify({
            'message': 'Training job started',
            'job_id': job_id
        })
    except Exception as e:
        current_app.logger.error(f"Error starting job: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_blueprint.route('/', defaults={'path': ''})
@main_blueprint.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(current_app.static_folder, path)):
        return send_from_directory(current_app.static_folder, path)
    return send_from_directory(current_app.static_folder, 'index.html')

