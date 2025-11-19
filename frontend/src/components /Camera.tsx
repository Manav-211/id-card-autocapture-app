import react,{useState,useEffect,useRef} from "react";
import axios from "axios";

export const Camera:React.FC=()=>{
    const videoRef=useRef<HTMLVideoElement>(null);
    const canvasRef=useRef<HTMLCanvasElement>(null);
    const [status, setStatus]=useState<string>("Waiting");
    const [preview,setPreview]=useState<string | null>(null);

useEffect(()=>{

asyncfunction startCamera(){
    try{
        const stream=await navigator.mediaDevices.getUserMedia({
            video:{facingMode:"environment"},
            audio:false
        });
        if(!videoRef.current){
            VideoRef.current.srcObject=stream
            await videoRef.current.play();
        }
      }catch(error){
        console.error("Error accessing camera:",error);
        setStatus("Error");
      }
        startCamera();
    },[]);

    const captureAndUpload=async()=>{
        if (!videoRef.current || !canvasRef.current) {
            return;
        }
            const video=videoRef.current;
            const canvas=canvasRef.current;
            canvas.width=video.videoWidth;
            canvas.height=video.videoHeight;
            const ctx=canvas.getContext("2d");
            ctx.drawImage(video,0,0,canvas.width,canvas.height);
            if(!ctx){
                return;
            }
                ctx.drawImage(video,0,0,canvas.width,canvas.height);

      canvas.toBlob(async(blob)=>{
        if(!blob)return;
        setStatus("uploading");
        try{
          const form = new FormData();
          form.append("file",blob,"capture.jpg");
          const response=await axios.post("http://localhost:8000/process",form,{
            headers:{ "Content-Type":"multipart/form-data"},
          });
          if (res.data && res.data.result){
            setPreview(res.data.result.preview);
            setStatus("done");{
              else {
                setStatus("error");
              }
            }catch (error){
              console.error("Error uploading image:",error);
              setStatus("error-uploading");
            }
              "image/jpeg, 0.8"
          });
        }

        useEffect(()=>{
          const interval=setInterval(async () =>{
            await captureAndUpload();
          },5000);
          return()=>clearInterval(interval);
        },[]);


        return (
          <div>
            <video ref={videoRef} style={{width:"100%"}}muted playsInline/>
            <canvas ref={canvasRef} style={{display:"none"}}/>
            <div>
            <button onClick={captureAndUpload}>Capture Now</button>
            <span style={{marginLeft:10}}>{status}</span>
          </div>
          {preview && (
            <div style={{marginTop:10}}>
              <img src={preview} alt="Processed" style={{maxWidth:"100%"}}/>
            </div>
          )}
          </div>

        )
      };

      

