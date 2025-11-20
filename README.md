# 🆔 ID Card Scanner - Smart Camera Capture

An **intelligent web application** that automatically captures perfect ID card photos using your device's camera with **real-time quality detection**.

--

##  Quick Start

### Backend Setup
```
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```
cd frontend
npm install
npm start
```

### How to Use

  1. Allow camera access when prompted.

  2. Position your ID card within the green frame.

  3. Wait for auto-capture or click "Capture Now".


### Features

 1.  Auto-capture - Captures automatically when image quality is optimal

 2. Real-time feedback - Shows sharpness and edge detection metrics

 3. Visual guidance - Green frame helps with positioning

 4. Manual control - Capture anytime with manual button

  Quality assurance - Ensures clear, readable ID card images

### Troubleshooting

 1. Camera not working?
  - **Refresh the page and allow permissions**
  - **Check browser camera settings**
  - **Ensure no other app is using the camera**

 2. Auto-capture not triggering?
  - **Improve lighting conditions**
  - **Hold device steady**
  - **Ensure ID card fills the green frame**

 3. Backend connection issues?
  - **Verify backend is running on port 8000**
  - **Check terminal for error messages**
  - **Restart both servers if needed**



