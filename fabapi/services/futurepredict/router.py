from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from .modelA_service import predict_next_positions

router = APIRouter(
    prefix="/modelA",
    tags=["Model A – Future Prediction"]
)

class ModelARequest(BaseModel):
    sequence: List[List[float]]  # last 10 timesteps
    steps: int = 10

@router.post("/predict")
def modelA_predict(req: ModelARequest):
    positions = predict_next_positions(req.sequence, req.steps)

    return {
        "success": True,
        "next_positions_m": positions,
        "message": "MODEL A prediction successful"
    }
