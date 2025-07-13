
from pydantic_settings import BaseSettings
from typing import ClassVar  

from pydantic import Field, SecretStr,AnyHttpUrl
from pytz import timezone

class Settings(BaseSettings):
    # External Data API

    data_api_url: str = ""
    facility: str = "uoa"

    #for time zone awareness
    FACILITY_TIMEZONES: ClassVar[dict] = {
        "uoa": timezone("Asia/Tokyo"), 
        "istic": timezone("Africa/Tunis"),
        "museum": timezone("Asia/Tokyo") 
    }

    # Intervals (in seconds)
    token_refresh_interval: int = 270   # 4 minutes 30 seconds
    fetch_interval: int = 60            # 1 minute

    # Default SSE update frequency
    default_sse_frequency: int = 60




   # Redis for Sense-API tokens
    redis_url: str = Field(
    "",
    env="REDIS_URL",
    description="Redis connection string for token cache"
    )

    frontend_host: str = Field(
        ...,                     # no default → required at runtime
        env="FRONTEND_HOST",
        description="URL of the Angular frontend "
    )


    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
print(f"[DEBUG] Realtime frontend_host = {settings.frontend_host}")