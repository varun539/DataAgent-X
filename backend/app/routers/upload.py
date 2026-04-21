from fastapi import APIRouter, UploadFile, File
import pandas as pd

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    return {
        "columns": list(df.columns),
        "rows": len(df)
    }