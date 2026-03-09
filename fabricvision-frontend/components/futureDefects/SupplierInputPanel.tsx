"use client";

import {useState} from "react";

export default function SupplierInputPanel({onSubmit}:{onSubmit:(supplier:string)=>void}){

  const [supplier,setSupplier] = useState("")

  return(

    <div className="flex gap-4">

      <input
        type="text"
        placeholder="Enter Supplier Name"
        value={supplier}
        onChange={(e)=>setSupplier(e.target.value)}
        className="border p-2 rounded w-64"
      />

      <button
        onClick={()=>onSubmit(supplier)}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Analyze
      </button>

    </div>
  )

}