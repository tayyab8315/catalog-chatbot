from fastapi import FastAPI, Body
from services.chatBot import runGraph

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}


@app.post("/chat")
def chat(message: str = Body(..., embed=True), thread_id: str = Body(..., embed=True)):
    print(f"Received message: {message}")
    response = runGraph(message, thread_id=thread_id)
    print(response["messages"][-1].content)
    answer = response["messages"][-1].content

    return {
        "history": response,
    }