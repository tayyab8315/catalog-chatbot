import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_core.tools import tool
 


def initializeLLM():
    load_dotenv()

    model_name = os.getenv("OLLAMA_MODEL", "gpt-oss:120b")
    base_url = os.getenv("OLLAMA_URL", "https://ollama.com")
    api_key = os.getenv("OLLAMA_API_KEY")

    print(f"Using model: {model_name}")
    print(f"Using base URL: {base_url}")
    print(f"Using API key: {api_key}")

    if not api_key:
        raise ValueError("OLLAMA_API_KEY is missing from the .env file")

    llm = ChatOllama(
        model=model_name,
        base_url=base_url,
        temperature=0,
        client_kwargs={
            "headers": {
                "Authorization": f"Bearer {api_key}",
            }
        },
    )
    return llm