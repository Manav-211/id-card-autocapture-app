import React from "react";
import Camera from "../components/Camera";

export const Home:React.FC=()=>{
    return(
        <div>
            <h1>ID Card Auto Capture</h1>
            <p> point your ID card  at the camera - it will captureperiodically</p>
            <Camera/>
        </div>

    );

};