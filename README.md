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

# Component 2 – Edge-Level Fabric Image Enhancement & Pattern-Aware Processing

Component 2 focuses on improving the visual quality of fabric images before defect detection. The module performs fabric pattern analysis, image quality assessment, and adaptive enhancement to ensure that downstream defect detection models receive clear, consistent, and high-quality images.

---

## Component 2 Workflow (3 Novelty Stages)

### Stage 1: Pattern-Aware Fabric Classification (Novelty 1)

**Goal:** Identify whether a fabric is patterned or non-patterned and determine the specific pattern category.

#### How it works:

- Incoming fabric frames are received from Component 1.
- A lightweight CNN-based binary classifier first determines whether the fabric contains patterns.
- If the fabric is classified as patterned, a second EfficientNetB0-based multi-class classifier identifies the pattern type.
- Supported pattern categories include:
  - Stripe
  - Check
  - Floral
  - Geometric

#### Outputs:

- Fabric category (Patterned / Non-Patterned)
- Pattern type prediction
- Confidence score
- Pattern metadata for enhancement selection

#### Why it matters:

- Different fabric patterns require different enhancement strategies.
- Prevents over-enhancement that could distort pattern structures.
- Enables context-aware preprocessing for improved inspection accuracy.

---

### Stage 2: Image Quality Assessment & Fabric Analysis (Novelty 2)

**Goal:** Evaluate image quality and fabric characteristics before enhancement.

#### How it works:

- Multiple image quality metrics are calculated for each frame.
- The system evaluates:
  - Brightness
  - Contrast
  - Sharpness
  - Noise level
  - Color consistency
- A Fabric Quality Index (FQI) is generated to represent overall image quality.
- Fabric characteristics and quality scores are used to determine the most suitable enhancement pipeline.

#### Outputs:

- Brightness score
- Contrast score
- Sharpness score
- Noise estimation
- Fabric Quality Index (FQI)

#### Why it matters:

- Prevents unnecessary processing of already high-quality images.
- Provides quantitative measurements for enhancement decisions.
- Ensures enhancement is applied only when required.

---

### Stage 3: Adaptive Pattern-Aware Enhancement Pipeline (Novelty 3)

**Goal:** Improve image quality while preserving fabric texture and pattern information.

#### How it works:

- Enhancement strategy is selected dynamically based on:
  - Fabric category
  - Pattern type
  - Quality metrics
- The enhancement pipeline may include:
  - Contrast enhancement (CLAHE)
  - Brightness correction
  - Noise reduction
  - Edge-preserving sharpening
  - Color normalization
- Patterned fabrics receive texture-preserving enhancement to avoid distortion.
- Non-patterned fabrics receive stronger enhancement when required.

#### Enhancement Decisions:

| Fabric Type | Enhancement Strategy |
|------------|----------------------|
| Non-Patterned | Aggressive contrast and sharpness enhancement |
| Stripe | Edge-preserving enhancement |
| Check | Texture-preserving contrast enhancement |
| Floral | Balanced color and texture enhancement |
| Geometric | Structure-aware sharpening |

#### Outputs:

- Enhanced fabric image
- Updated quality metrics
- Enhancement metadata
- Processed frame for defect detection

#### Why it matters:

- Improves visibility of fabric defects.
- Preserves important texture information.
- Enhances downstream defect detection accuracy.
- Maintains real-time processing performance on edge devices.

---

## Data Logging & Monitoring

The module continuously records processing information including:

- Pattern classification results
- Confidence scores
- Quality metrics
- Enhancement mode selected
- Processing time per frame
- System performance statistics

Generated logs support system monitoring and future model improvements.

---

## Pipeline Integration

### Input

Receives filtered fabric frames from **Component 1**.

### Processing

1. Pattern Classification
2. Quality Assessment
3. Adaptive Enhancement

### Output

Enhanced and optimized fabric images are forwarded to **Component 3 – Defect Detection & Localization**.

---

## Software Environment & Tools

### Development Frameworks

- Python 3.10+
- TensorFlow / Keras
- OpenCV
- NumPy
  
### Deep Learning Models

- CNN Binary Classifier
- EfficientNetB0 Multi-Class Classifier

### Deployment Environment

- Raspberry Pi 4 Model B
- Edge/Fog Computing Layer

---

## Key Contributions

✅ Pattern-aware fabric classification

✅ Multi-stage adaptive image enhancement

✅ Real-time edge-level processing

✅ Fabric Quality Index (FQI) assessment

✅ Texture-preserving enhancement for patterned fabrics

✅ Improved downstream defect detection performance

✅ Lightweight deployment on Raspberry Pi edge devices

---

## Expected Benefits

- Improved image quality under varying lighting conditions
- Reduced noise and visual inconsistencies
- Better defect visibility
- Higher defect detection accuracy
- Lower computational overhead
- Real-time industrial deployment capability

<hr>

## **_Component 3 – Title_**

### Add Details about Component 3 here

<hr>

## **_Component 4 – Title_**

### Add Details about Component 4 here

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
uvicorn app:socket_app --host 0.0.0.0 --port 8000 --reload
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



