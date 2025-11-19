from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.process import process_image



app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process")
async def upload(file: UploadFile = File(...)):
  content = await file.read()
  result = process_image(content)
  return {"message": "processed", "result": result}

@app.get("/")
def read_root():
  return {"status": "ok"}

