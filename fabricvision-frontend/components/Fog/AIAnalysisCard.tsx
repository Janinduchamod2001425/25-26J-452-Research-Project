import AnimatedMetricCard from "./AnimatedMetricCard";
import Image from "next/image";
import fabricPreview from "@/assets/im_1.png";

export default function AIAnalysisCard() {
  return (
    <section className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        AI-Based Enhancement Analysis
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center">
          <div className="w-56 h-40 bg-slate-200 rounded-xl mb-3 relative overflow-hidden">
            <Image
              src={fabricPreview}
              alt="Enhanced Fabric Preview"
              fill
              className="object-cover rounded-xl"
              priority
            />
          </div>
          <button className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-600 border border-slate-200">
            Before / After toggle
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedMetricCard
            title="Brightness Balance"
            value={91}
            color="text-sky-600"
            note="Target: 90–110%"
          />
          <AnimatedMetricCard
            title="Texture Clarity"
            value={87}
            color="text-emerald-600"
            note="Based on edge density & detail"
          />

          <AnimatedMetricCard
            title="Frame Quality Score"
            value={89}
            color="text-indigo-600"
            note="Brightness + texture + noise"
          />

          <div className="md:col-span-3">
            <div className="inline-flex items-center px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
              <span className="mr-2">✅</span>
              Enhancement successful for current fabric profile.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
