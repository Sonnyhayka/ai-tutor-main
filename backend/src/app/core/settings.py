from dotenv import load_dotenv
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow",
    )
    app_name: str = "AI Tutor API"
    app_version: str = "0.1.0"
    environment: str = Field(
        default="development",
        description="Runtime environment. Set to production for deployed instances.",
    )

    secret_key: str = Field(default="", description="Secret key for JWT")
    algorithm: str = Field(default="HS256", description="Algorithm used for JWT")
    access_token_expire_minutes: int = Field(
        default=30,
        description="Token expiration (minutes)",
    )

    database_url: str = Field(
        default="sqlite:///./ai_tutor.db",
        description="Database connection URL",
    )

    client_id: str = Field(
        default="",
        description="Google OAuth2 client ID",
    )
    client_secret: str = Field(
        default="",
        description="Google OAuth2 client secret",
    )
    redirect_uri: str = Field(
        default="http://localhost:3000/api/v1/user/auth/google/callback",
        description="Redirect URI for OAuth2",
    )
    token_uri: str = Field(
        default="https://oauth2.googleapis.com/token",
        description="Google token exchange endpoint",
    )

    session_secret: str = Field(
        default="",
        description="Session secret key for cookies/sessions",
    )
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        description="Comma-separated frontend origins allowed by CORS",
    )
    frontend_url: str = Field(
        default="http://localhost:5173",
        description="Frontend URL",
    )
    backend_url: str = Field(
        default="http://localhost:3000",
        description="Backend API URL",
    )
    project_id: str = Field(
        default="",
        description="Google Cloud project ID",
    )
    mcp_server: str = Field(
        default="http://127.0.0.1:8000/mcp",
        description="FastMCP server URL",
    )
    fernet_key: str = Field(
        default="",
        description="Secret key used to encrypt and decrypt google oauth2 tokens",
    )
    eleven_key: str = Field(
        default="",
        description="The eleven labs api key from .env",
    )
    openai_key: str = Field(
        default="",
        description="The open ai api key from .env",
    )
    gemini_key: str = Field(
        default="",
        description="The gemini api key from .env",
    )

    @property
    def allowed_cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @model_validator(mode="after")
    def require_secure_production_settings(self) -> "Settings":
        if self.environment.lower() != "production":
            return self

        required_fields = (
            "secret_key",
            "session_secret",
            "client_id",
            "client_secret",
            "fernet_key",
        )
        for field_name in required_fields:
            if not getattr(self, field_name):
                msg = f"{field_name.upper()} must be configured for production."
                raise ValueError(msg)

        if "*" in self.allowed_cors_origins:
            msg = "CORS_ORIGINS cannot contain '*' in production."
            raise ValueError(msg)

        return self


settings = Settings()
