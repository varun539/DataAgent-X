
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DataAgent X API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "DataAgent X Backend Running 🚀"}

# Import routers
from app.routers.analyze import router as analyze_router
from app.routers.chat    import router as chat_router
from app.routers.upload  import router as upload_router

# Register with prefixes
app.include_router(analyze_router, prefix="/analyze", tags=["ML"])
app.include_router(chat_router,    prefix="/chat",    tags=["Chat"])
app.include_router(upload_router,  prefix="/upload",  tags=["Upload"])