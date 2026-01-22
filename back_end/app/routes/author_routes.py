from fastapi import FastAPI

app = FastAPI()

@app.post("/authors")
async def root():
    return {"message": "Hello World"}



@app.get("/authors")
async def root():
    return {"message": "Hello World"}

@app.get("/authors/author_id")
async def root():
    return {"message": "Hello World"}

