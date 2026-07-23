use config::Environment;
use serde::Deserialize;

use crate::error::AppResult;

#[derive(Deserialize, Debug, Clone)]
pub struct AppConfig {
    pub database: DatabaseConfig,
    pub web_base_url: String,
}

impl AppConfig {
    pub fn from_env() -> AppResult<Self> {
        dotenv::dotenv().ok();
        let config = config::Config::builder()
            .add_source(Environment::default().separator("__"))
            .build()
            .and_then(|config| config.try_deserialize())?;

        Ok(config)
    }
}

#[derive(Deserialize, Debug, Clone)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub database: String,
}
