-- Vytvoření tabulky analytics_events pro lokální analytics
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    page_path VARCHAR(255) NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(100),
    user_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Additional metadata jako JSON
    metadata JSONB DEFAULT '{}',
    
    -- Indexy pro rychlé dotazy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexy pro optimalizaci dotazů
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Vložení vzorových dat pro testování
INSERT INTO analytics_events (event_type, page_path, referrer, user_agent, session_id, metadata) VALUES
('pageview', '/', 'https://google.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'session_1', '{"country": "CZ", "device": "desktop"}'),
('pageview', '/aktuality', 'direct', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', 'session_2', '{"country": "CZ", "device": "mobile"}'),
('pageview', '/', 'https://facebook.com', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'session_3', '{"country": "SK", "device": "desktop"}'),
('pageview', '/admin', 'direct', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'session_4', '{"country": "CZ", "device": "desktop"}'),
('pageview', '/aktuality', 'https://google.com', 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)', 'session_5', '{"country": "CZ", "device": "tablet"}')
ON CONFLICT DO NOTHING;