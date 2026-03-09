"use client";

import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/modelB/analyze";

export interface ModelBResponse {
  supplier_risk_score:number;
  roll_risk_score:number;
  root_cause_class:number;
}

export const useModelBAnalytics = () => {

  const [data,setData] = useState<ModelBResponse|null>(null)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState<string|null>(null)

  const predict = async (supplier:string) => {

    setLoading(true)

    try{

      const res = await fetch(API_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({supplier})
      })

      const json = await res.json()

      setData(json)

    }catch(err:any){

      setError("Failed to fetch analytics")

    }finally{
      setLoading(false)
    }

  }

  return {data,loading,error,predict}

}