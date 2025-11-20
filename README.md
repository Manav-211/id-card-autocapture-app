# 🆔 ID Card Scanner - Smart Camera Capture

An **intelligent web application** that automatically captures perfect ID card photos using your device's camera with **real-time quality detection**.

--

##  Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

### Frontend Setup
cd frontend
npm install
npm start

### How to Use

  Allow camera access when prompted.

  Position your ID card within the green frame.

  Wait for auto-capture or click "Capture Now".

  Download your perfect ID card image.

### Features

  Auto-capture - Captures automatically when image quality is optimal
  Real-time feedback - Shows sharpness and edge detection metrics
  Visual guidance - Green frame helps with positioning
  Manual control - Capture anytime with manual button
  Quality assurance - Ensures clear, readable ID card images

### Troubleshooting

  Camera not working?
  Refresh the page and allow permissions
  Check browser camera settings
  Ensure no other app is using the camera
  Auto-capture not triggering?
  Improve lighting conditions
  Hold device steady
  Ensure ID card fills the green frame
  Backend connection issues?
  Verify backend is running on port 8000
  Check terminal for error messages
  Restart both servers if needed



