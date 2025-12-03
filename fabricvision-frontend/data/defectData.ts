// data/defectData.ts
export const defectData = {
  annotatedImage: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  
  encoder: {
    speed: "147 RPM",
    activeDuration: "12m 44s",
    lengthMeasured: "41.2m",
    idleTime: "03m 10s",
  },

  defectDetail: {
    type: "Hole",
    severity: "Medium",
    confidence: "94%",
    location: {
      fabricLength: "42.34 m",
      xPos: "0.88 m from left edge",
      yPos: "42.36 m from start",
    },
  },

  history: [
    { time: "14:57", date: "Nov 16, 2025", type: "Hole", confidence: "94%" },
    { time: "14:42", date: "Nov 16, 2025", type: "Stain", confidence: "81%" },
    { time: "14:28", date: "Nov 16, 2025", type: "Line", confidence: "92%" },
    { time: "14:15", date: "Nov 16, 2025", type: "Hole", confidence: "88%" },
    { time: "14:03", date: "Nov 16, 2025", type: "Stain", confidence: "76%" },
    { time: "13:51", date: "Nov 16, 2025", type: "Line", confidence: "94%" },
  ],

  classification: {
    stain: 132,
    holes: 54,
    line: 345,
  },

  averageDefects: {
    percent: "10%",
    lastActive: "Nov 17, 2025",
  },
};