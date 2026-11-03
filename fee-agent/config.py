import os
from pathlib import Path

from agents import OpenAIChatCompletionsModel, OpenAIProvider, RunConfig
from dotenv import load_dotenv
from openai import AsyncOpenAI


load_dotenv(Path(__file__).with_name(".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

external_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

model = OpenAIChatCompletionsModel(
    model="gemini-2.5-flash",
    openai_client=external_client,
)

model_provider = OpenAIProvider(openai_client=external_client)

config = RunConfig(
    model=model,
    model_provider=model_provider,
    tracing_disabled=True,
)
