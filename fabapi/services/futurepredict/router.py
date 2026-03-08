from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from .modelA_service import predict_from_defects

router = APIRouter(
    prefix="/modelA",
    tags=["Model A – Future Prediction"]
)

class DefectRecord(BaseModel):
    defect_type: str
    position_cm: float
    timestamp: str

class ModelARequest(BaseModel):
    defects: List[DefectRecord]
    steps: int = 30


@router.post("/predict")
def modelA_predict(req: ModelARequest):

    predictions = predict_from_defects(req.defects, req.steps)

    return {
        "success": True,
        "next_positions_cm": predictions,
        "steps": req.steps
    }