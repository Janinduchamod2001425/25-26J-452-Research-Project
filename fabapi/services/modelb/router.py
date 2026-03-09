from fastapi import APIRouter
from pydantic import BaseModel
from .modelB_service import run_modelB

router = APIRouter(prefix="/modelB", tags=["Model B"])

class SupplierInput(BaseModel):
    supplier:str


@router.post("/analyze")
def analyze_supplier(data:SupplierInput):

    result = run_modelB(data.supplier)

    return result