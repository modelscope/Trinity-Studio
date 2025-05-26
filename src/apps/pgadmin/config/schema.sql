-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS rft_dataset (
    id SERIAL PRIMARY KEY,
    consumed_cnt INTEGER DEFAULT 0,
    last_modified_date TIMESTAMP,
    from_id INTEGER,
    from_model TEXT,
    from_recipe TEXT,
    prompt TEXT,
    response TEXT,
    solution TEXT,
    reward FLOAT,
    chosen TEXT,
    rejected TEXT,
    label TEXT,
    quality_score FLOAT DEFAULT 0.0,
    quality_score_detail JSONB,
    difficulty_score FLOAT DEFAULT 0.0,
    difficulty_score_detail JSONB,
    diversity_score FLOAT DEFAULT 0.0,
    diversity_score_detail JSONB,
    priority FLOAT DEFAULT 0.0,
    reward_fn TEXT,
    workflow TEXT
);

CREATE TABLE IF NOT EXISTS task_buffer (
    id SERIAL PRIMARY KEY,
    task_desc VARCHAR,
    workflow_type VARCHAR,
    reward_type VARCHAR
);

CREATE TABLE IF NOT EXISTS experience_buffer (
    id SERIAL PRIMARY KEY,
    serialized_exp BYTEA,
    prompt VARCHAR,
    response VARCHAR,
    reward FLOAT,
    consumed INTEGER DEFAULT 0,
    priority FLOAT DEFAULT 0.0
); 