import React,{useState,useEffect,useRef} from "react";
import axios from "axios";
import "./Camera.css";
import { useVideoStream } from "../hooks/useVideoStream";
import { getImageDataFromVideo, grayFromImageData, sobelMagnitude, sharpnessMetric, edgeAreaPercent } from "../utils/imageProcessing";

export const Camera:React.FC=()=>{
    const videoRef = useVideoStream();
    const canvasRef=useRef<HTMLCanvasElement>(null);
    const [status, setStatus]=useState<string>("Waiting");
    const [preview,setPreview]=useState<string | null>(null);
    const [isCameraReady,setIsCameraReady]=useState<boolean>(false);
    const [isProcessing,setIsProcessing]=useState<boolean>(false);
    const [autoCapture, setAutoCapture] = useState<boolean>(true);
    const [localSharpness, setLocalSharpness] = useState<number>(0);
    const [localEdgeArea, setLocalEdgeArea] = useState<number>(0);
    const [isReadyToCapture, setIsReadyToCapture] = useState<boolean>(false);

    
    useEffect(() => {
        const checkCameraReady = () => {
            if (videoRef.current && videoRef.current.videoWidth > 0) {
                setIsCameraReady(true);
                setStatus("Camera ready - point at ID card");
            }
        };

        const interval = setInterval(checkCameraReady, 500);
        return () => clearInterval(interval);
    }, []);

    const captureAndUpload=async()=>{
        if (!videoRef.current || !canvasRef.current || !isCameraReady || isProcessing) {
            return;
        }
          setIsProcessing(true);
          setStatus("Capturing");
            const video=videoRef.current;
            const canvas=canvasRef.current;


            try {
                const imageData = getImageDataFromVideo(video, canvas);
                if (imageData) {
                const { gray, width, height } = grayFromImageData(imageData);
                const magnitude = sobelMagnitude(gray, width, height);
                 const sharpness = sharpnessMetric(gray, width, height);
                  const edgeArea = edgeAreaPercent(magnitude, width, height, 30);
                 setLocalSharpness(sharpness);
                 setLocalEdgeArea(edgeArea);
                setIsReadyToCapture(sharpness > 1000 && edgeArea > 5);
                }
            } catch (error) {
                console.warn("Local processing failed:", error);

            }

            canvas.width=video.videoWidth;
            canvas.height=video.videoHeight;
            const ctx=canvas.getContext("2d");
            if (!ctx) {
              return;
          }
            ctx.drawImage(video,0,0,canvas.width,canvas.height);


      canvas.toBlob(async(blob)=>{
        if(!blob){
          setIsProcessing(false);
          setStatus("error-capturing");
          return;
        }
        setStatus("uploading");
        try{
          const form = new FormData();
          form.append("file",blob,"capture.jpg");
          const response=await axios.post("http://localhost:8000/process",form,{
            headers:{ "Content-Type":"multipart/form-data"},
          });
          if (response.data?.result) {
            const { sharpness, edge_ratio, card_detected, analysis_on_cropped } = response.data.result;

            setPreview(response.data.result.preview);

            if (card_detected) {
            setStatus(`ID Card detected! Sharp: ${sharpness.toFixed(1)}, Edge: ${edge_ratio.toFixed(3)}`);
            if (autoCapture) {
            setAutoCapture(false);
              }
            } else if (sharpness > 50 && edge_ratio > 0.02) {
              setStatus(`Good quality but no ID card detected. Sharp: ${sharpness.toFixed(1)}, Edge: ${edge_ratio.toFixed(3)}`);
            } else {
              setStatus(`Adjusting... Sharp: ${sharpness.toFixed(1)}, Edge: ${edge_ratio.toFixed(3)}, Local: ${localSharpness.toFixed(0)}`);
            }
          }else {
            setStatus("error");
          }
        }catch (error){
              console.error("Error uploading image:",error);
              setStatus("Upload failed - check backend connection");
            }
            setIsProcessing(false);
          });
        }

        useEffect(() => {
          if (!isCameraReady || !autoCapture) return;

          const interval = setInterval(async () => {
              if (!isProcessing && videoRef.current && videoRef.current.videoWidth > 0) {
             try {
             await captureAndUpload();
             } catch (error) {
            console.error("Auto-capture error:", error);
            setStatus("Auto-capture error - continuing...");
            }
              }
          }, 3000);
          return () => clearInterval(interval);
      }, [isCameraReady, autoCapture, isProcessing]);


      return (
        <div className="camera-container">

            <div className="camera-view">
             <video ref={videoRef} className="camera-video" muted playsInline />

                <div className="camera-overlay">
                 <div className={`id-card-frame ${isReadyToCapture ? 'ready-to-capture' : ''}`}>
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
                    </div>
                </div>
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="camera-controls">
                <button
                    className="capture-button"
                    onClick={captureAndUpload}
                    disabled={!isCameraReady || isProcessing}
                >
                    {isProcessing ? "Processing..." : "Capture Now"}
                </button>

                <div className="control-buttons">
                    <label className="auto-capture-toggle">
                  <input
                   type="checkbox"
                   checked={autoCapture}
                   onChange={(e) => setAutoCapture(e.target.checked)}
                        />
                 Auto-capture
                </label>
                </div>

                <div className="status-display">
                    <div>Status: {status}</div>
                    <div>Local - Sharpness: {localSharpness.toFixed(0)}, Edge Area: {localEdgeArea.toFixed(1)}%</div>
                </div>
            </div>

            {preview && (
                <div className="preview-container">
                    <h3> Captured Image</h3>
                    <img src={preview} alt="Processed" className="preview-image" />
                </div>
            )}
        </div>
    );
};


export default Camera;
