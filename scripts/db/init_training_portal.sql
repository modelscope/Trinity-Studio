-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    description TEXT,
    is_template BOOLEAN DEFAULT FALSE
);

-- Create recipe_versions table for versioning
CREATE TABLE IF NOT EXISTS recipe_versions (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    comment TEXT,
    UNIQUE(recipe_id, version_number)
);

-- Create recipe_runs table to track training runs
CREATE TABLE IF NOT EXISTS recipe_runs (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    metrics JSONB,
    error_message TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);
CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe_id ON recipe_versions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_runs_recipe_id ON recipe_runs(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_runs_status ON recipe_runs(status);

-- Insert sample recipe
INSERT INTO recipes (name, content, description, is_template)
VALUES (
    'sample_recipe',
    '{
        "model": {
            "project": "sample-project",
            "name": "sample-model",
            "modelPath": "/path/to/model",
            "checkpointPath": "/path/to/checkpoint",
            "monitorType": "wandb",
            "nodeNum": 1,
            "gpuPerNode": 1,
            "maxPromptTokens": 2048,
            "maxResponseTokens": 2048
        },
        "buffer": {
            "totalEpochs": 1,
            "taskNumPerBatch": 1,
            "datasetPath": "/path/to/dataset",
            "defaultWorkflowType": "default",
            "defaultRewardFnType": "default",
            "storageType": "file"
        },
        "connector": {
            "engineType": "vllm",
            "engineNum": 1,
            "tensorParallelSize": 1,
            "repeatTimes": 1,
            "syncMethod": "async",
            "syncIterationInterval": 1
        },
        "trainer": {
            "trainerType": "verl",
            "algorithmType": "ppo",
            "sftWarmupIteration": 0,
            "evalInterval": 100,
            "saveFreq": 1000
        }
    }'::jsonb,
    'Sample recipe for testing',
    TRUE
) ON CONFLICT (name) DO NOTHING; 