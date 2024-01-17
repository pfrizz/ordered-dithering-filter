import { useRef, useEffect, useCallback } from 'react';

function Canvas(props) {
    const canvasRef = useRef(null);
    const webcamRef = useRef(null);
    const requestRef = useRef(null);

    function getCamera() {
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                webcamRef.current.srcObject = stream;
            });
        } 
    }

    async function startCamera() {
        await webcamRef.current.play();
    }

    const renderImage =  useCallback(() => {
        function processImage(context) {
            // disable image smoothing across different browsers
            context.msImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;

            let canvasWidth = canvasRef.current.width;
            let canvasHeight = canvasRef.current.height;

            let resizedWidth = (canvasWidth/props.options.pixelSize) | 0;
            let resizedHeight = (canvasHeight/props.options.pixelSize) | 0
    
            //scale down image and then scale it back up to achieve pixelated look
            context.drawImage(webcamRef.current, 0, 0, resizedWidth, resizedHeight);
            recolorImage(context, resizedWidth, resizedHeight);
            context.drawImage(canvasRef.current, 0, 0, resizedWidth, resizedHeight, 0, 0, canvasWidth, canvasHeight);
        }

        function recolorImage(context, width, height){
            const imageData = context.getImageData(0, 0, width, height);
            const data = imageData.data;
    
            for(let i = 0; i < data.length; i += 4) {
                // apply brightness changes
                data[i] += props.options.brightness;
                data[i + 1] += props.options.brightness;
                data[i + 2] += props.options.brightness;
                
                if(props.options.isDithered) {
                    let thresholdMapSize = props.options.thresholdMap.length;
                    //let bayerR = 255/props.options.palette.length;
                    let bayerR = props.options.ditheringIntensity;
        
                    // get pixel's corresponding spot on tiled threshold map
                    let x = ((i / 4) % width)  % thresholdMapSize;
                    let y = (((i/ 4) / width) | 0) % thresholdMapSize;
        
                    // apply threshold map to all color channels of current pixel
                    data[i] += bayerR * ((props.options.thresholdMap[x][y] / thresholdMapSize**2)  - 0.5);
                    data[i + 1] += bayerR * ((props.options.thresholdMap[x][y] / thresholdMapSize**2) - 0.5);
                    data[i + 2] += bayerR * ((props.options.thresholdMap[x][y] / thresholdMapSize**2) - 0.5);
                }
    
                // now find color in palette closest to pixel's value using distance formula
                let closestColor = props.options.palette[0];
                let deltaRed = data[i] - closestColor[0];
                let deltaGreen = data[i + 1] - closestColor[1];
                let deltaBlue = data[i + 2] - closestColor[2];
                let closestColorDistance = Math.sqrt(deltaRed**2 + deltaGreen**2 + deltaBlue**2);
                
                for(let j = 1; j < props.options.palette.length; j++){
                    deltaRed = data[i] - props.options.palette[j][0];
                    deltaGreen = data[i + 1] - props.options.palette[j][1];
                    deltaBlue = data[i + 2] - props.options.palette[j][2];
    
                    let distance = Math.sqrt(deltaRed**2 + deltaGreen**2 + deltaBlue**2);
                    if(distance < closestColorDistance) {
                        closestColor = props.options.palette[j];
                        closestColorDistance = distance;
                    }
                }
    
                // finally, set current pixel to the appropriate color from palette
                data[i] = closestColor[0];
                data[i + 1] = closestColor[1];
                data[i + 2] = closestColor[2];
            }
    
            context.putImageData(imageData, 0, 0);
        }

        // if view width is less than camera feed width, adjust canvas size to fit in view
        const viewWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        if (viewWidth < webcamRef.current.videoWidth) { 
            let newWidth = viewWidth - 10;
            canvasRef.current.width = newWidth;
            canvasRef.current.height = (newWidth / webcamRef.current.videoWidth) * webcamRef.current.videoHeight;

            webcamRef.current.width = canvasRef.current.width;
            webcamRef.current.height = canvasRef.current.height;
        }
        else{
            canvasRef.current.width = webcamRef.current.videoWidth;
            canvasRef.current.height = webcamRef.current.videoHeight;
        }
        const context = canvasRef.current.getContext('2d', { willReadFrequently: true });

        processImage(context);

        requestRef.current = requestAnimationFrame(renderImage);
    }, [props]);

    useEffect(() => {
        if(requestRef.current === null){
            getCamera();
        }
        else{
            cancelAnimationFrame(requestRef.current);
            requestRef.current = requestAnimationFrame(renderImage);
        }
    }, [renderImage]);

    return (
        <div className="Canvas">
            <video ref={webcamRef} id="video" 
                hidden={props.options.isDithered}
                onCanPlay={startCamera} 
                onPlaying={() => {requestRef.current = requestAnimationFrame(renderImage)}} />
            <canvas hidden={!props.options.isDithered} ref={canvasRef}/>
        </div>
    );
}

export default Canvas