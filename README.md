###### 25-26J-452 - Research-Project

# 🧵 FabricVision - AI-Driven Fabric Defect Detection & Monitoring System for the Apparel Industry in SRI LANKA

![Cover_Image](cover/thumbnail.png)

FabricVision is an AI-driven real-time fabric inspection system integrating camera-based acquisition, edge-level enhancement, ML defect detection, and a centralized QC dashboard. It automates inspection, improves defect accuracy, and provides real-time monitoring, traceability, and decision support.

###  **Team Members:**

* Member 1 - Nagahawaththa J.C.D - IT22573896 (Team Lead)
* Member 2 - Kamburugamuwa K.S.D - IT22574572
* Member 3 - Jayasinghe J.A.D.T.S - IT22028464
* Member 4 - Kavinda S.G.D - IT22603654

<hr>

<details>
<summary>System Components:</summary> 

## **_Component 1 – Intelligent Fabric Capture, Anomaly Pre-Screening & Quality Analytics_**

Component 1 focuses on capturing only meaningful fabric frames, pre-screening unusual frames, and deciding whether frames are suitable for defect detection.
This ensures the downstream defect detection modules receive high-quality and relevant frames, improving overall reliability.

### 1) Component 1 Workflow (3 Novelty Stages)

### _**Stage 1: Motion-Aware Event-Based Frame Extraction (Novelty 1)**_

Goal: Reduce redundant frame capture and only extract frames when fabric is moving meaningfully.

How it works:

* Live camera feed/video frames are continuously observed.
* A MobileNetV2-based motion classifier detects fabric presence and motion state (e.g., idle / active).
* Frames are captured only when motion is valid (event-based trigger).

Outputs:

* Selected frames (active motion)
* Logs/metrics: total frames, saved frames, ignored frames, motion state timeline

Why it matters:

* Reduces processing cost and latency
* Prevents sending irrelevant/duplicate frames downstream

### **_Stage 2: Unsupervised Anomaly Pre-Screening (Novelty 2)_**

Goal: Identify unusual frames early without needing defect labels.

How it works:

* An Autoencoder model (AnomalyAutoencoder128) is trained using only normal fabric frames.
* For each incoming frame, the model calculates reconstruction error (MSE).
* Based on error thresholds, frames are categorized as:
  1. Normal
  2. Borderline
  3. Irregular

Outputs:

* Frame category (normal/borderline/irregular)
* Frame Irregularity Score (FIS) + threshold used
* Only borderline + irregular are forwarded to the next stage

Why it matters:

* Early filtering reduces noise
* Highlights suspicious frames for deeper quality validation

### _**Stage 3: Frame Quality Intelligence & Routing (Novelty 3)**_

Goal: Decide whether suspicious frames are usable for defect detection or must be enhanced/held.

How it works:

* Borderline/Irregular frames are evaluated via a quality assessment API (rule-based logic for now).

Inputs include:

1. Motion state + confidence
2. Frame type (borderline/irregular)
3. FIS + threshold

The system returns:

1. Frame quality: good / poor
2. Risk level: low / high / critical
3. Action: continue / alert_operator

Routing decisions:

* Usable → Forward to defect detection (or next component)
* Needs enhancement → Forward to Fog enhancement
* Rejected/Hold → Drop/Hold + operator alert + roll-level recommendation

Roll-level decision support (important for panel Q/A):

* System tracks rejected ratio (% poor/held frames).
* If rejected ratio exceeds a threshold → recommend operator actions such as:

  1. check lighting/camera vibration
  2. slow machine speed
  3. re-capture affected segment / re-run inspection

Why it matters:

* Prevents misleading defect detection from blurry/unstable frames
* Protects overall system accuracy by ensuring input quality

<hr>

### **_Component 2 – Title_**

<hr>

### **_Component 3 – Title_**

<hr>

### **_Component 4 – Title_**

</details>

<hr>

## **Technology Stack:**

* Frontend: Next.js, Tailwind CSS, Chart.js, Framer Motion
* Backend: FastAPI, Python, OpenCV, TensorFlow/PyTorch
* Machine Learning: MobileNetV2, Autoencoder128, YOLOv9, XGBoost, LSTM

## **Project Running Script :**

Backend Setup:

```bash
cd fabapi
pip install -r requirements.txt
uvicorn main:app --reload --host
```

Frontend Setup:

```bash
cd fabricvision-frontend
pnpm install
pnpm run dev
```

If pnpm is not installed, install it via npm:

```bash
npm install -g pnpm
```



