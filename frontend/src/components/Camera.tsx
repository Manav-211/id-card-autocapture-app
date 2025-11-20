import React,{useState,useEffect,useRef} from "react";
import axios from "axios";
import "./Camera.css";

export const Camera:React.FC=()=>{
    const videoRef=useRef<HTMLVideoElement>(null);
    const canvasRef=useRef<HTMLCanvasElement>(null);
    const [status, setStatus]=useState<string>("Waiting");
    const [preview,setPreview]=useState<string | null>(null);
    const [isCameraReady,setIsCameraReady]=useState<boolean>(false);
    const [isProcessing,setIsProcessing]=useState<boolean>(false);

useEffect(()=>{

async function startCamera(){
    try{
        const stream=await navigator.mediaDevices.getUserMedia({
            video:{facingMode:"environment"},
            audio:false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStatus("Camera ready - point at ID card");
          setIsCameraReady(true);
      }

    } catch(error) {
        console.error("Error accessing camera:",error)
        setStatus("Error");
      }
    }
    startCamera();
    }, []);

    const captureAndUpload=async()=>{
        if (!videoRef.current || !canvasRef.current || !isCameraReady || isProcessing) {
            return;
        }
          setIsProcessing(true);
          setStatus("Capturing");
            const video=videoRef.current;
            const canvas=canvasRef.current;
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
            const { sharpness, edge_ratio } = response.data.result;
            if (sharpness > 50 && edge_ratio > 0.02) {

              setPreview(response.data.result.preview);
              setStatus("good capture");
            } else {
              setStatus("not good: sharp=" + sharpness.toFixed(1) + " edge=" + edge_ratio.toFixed(3));
            }
          }else {
            setStatus("error");
          }
        }catch (error){
              console.error("Error uploading image:",error);
              setStatus("error-uploading");
            }
            setIsProcessing(false);
          });
        }

        useEffect(() => {
          const interval = setInterval(async () => {
              await captureAndUpload();
          }, 8000);
          return () => clearInterval(interval);
      }, []);


      return (
        <div className="camera-container">

            <div className="camera-view">
             <video ref={videoRef} className="camera-video" muted playsInline />

                <div className="camera-overlay">
                 <div className="id-card-frame">
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

                <span className="status-text">{status}</span>
            </div>

            {preview && (
                <div className="preview-container">
                    <img src={preview} alt="Processed" className="preview-image" />
                </div>
            )}
        </div>
    );
};


export default Camera;
