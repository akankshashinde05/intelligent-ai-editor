from fastapi import FastAPI

app = FastAPI(title="test_fastapi_proj")

@app.get("/")
def root():
    return {"message": "Welcome to test_fastapi_proj", "status": "active"}
