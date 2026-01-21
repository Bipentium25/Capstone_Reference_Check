from fastapi import FastAPI

app = FastAPI()

@app.get("/user")
async def root():
    return {"message": "Hello World"}