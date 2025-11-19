import React from "react";
import Camera from "../components/Camera";

export const Home:React.FC=()=>{
    return(
        <div>
            <h1>ID Card Auto Capture</h1>
            <p> point your camera at the ID card - it will captureperiodically</p>
            <Camera/>
        </div>

    );

};