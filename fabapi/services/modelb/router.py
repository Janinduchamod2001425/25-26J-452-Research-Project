from fastapi import APIRouter
from pydantic import BaseModel

from .modelB_service import predict_modelB

router = APIRouter(prefix="/modelB", tags=["Model B – Risk & RCA"])

class ModelBRequest(BaseModel):
    SupplierEnc: int
    RollLength: float
    DefectCount: int
    AvgSeverity: float
    DefectDensity: float
    MeanInterval: float
    StdInterval: float

@router.post("/predict")
def modelB_predict(req: ModelBRequest):
    result = predict_modelB(req.dict())

    return {
        "success": True,
        "risk_score": result["risk_score"],
        "pattern_class": result["pattern_class"],
        "rca_class": result["rca_class"],
        "message": "MODEL B prediction successful"
    }