import { useRef, useEffect, useState, useMemo } from 'react';
import { BASE_THRESHOLD_MAP } from './Constants';

function Canvas({ options }) {
    const canvasRef = useRef(null);
    const webcamRef = useRef(null);
    const requestRef = useRef(null);
    const [context, setContext] = useState(null);

    function getCamera() {
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                webcamRef.current.srcObject = stream;
            });
        } 
    }

    async function startCamera() { await webcamRef.current.play() }

    /**
     * Bayer matrix with side length log2(n) - 1, recalculated when n value is changed in options
     * @see https://en.wikipedia.org/wiki/Ordered_dithering#Threshold_map
     */
    const thresholdMap = useMemo(() => { 
        const generateThresholdMap = (n) => {
            if (n === 0) {
                return BASE_THRESHOLD_MAP;
            }
            else {
                let newThresholdMap = [...Array(2 ** (n + 1))].map(() => Array(2**(n + 1)).fill(0));
                let previousThresholdMap = generateThresholdMap(n - 1);
                for (let i = 0; i < newThresholdMap.length; i++) {
                    for (let j = 0; j < newThresholdMap[i].length; j++) {
                        let quadrantX = (i / 2**n) >= 1 ? 1 : 0;
                        let quadrantY = (j / 2**n) >= 1 ? 1 : 0;

                        newThresholdMap[i][j] = 4 * previousThresholdMap[i % 2**n][j % 2**n] 
                            + BASE_THRESHOLD_MAP[quadrantX][quadrantY];
                    }
                }
                return newThresholdMap;
            }
        };
        return generateThresholdMap(options.thresholdMapN.value);
    }, [options.thresholdMapN.value])

    /**
     * Calculates the distance between two points in 3-D space
     * @param p1 point in the form [x1, y1, z1]
     * @param p2 point in the form [x2, y2, z2]
     * @returns the distance between the two points
     */
    function distanceFormula(p1, p2) {
        let deltaX = p1[0] - p2[0];
        let deltaY = p1[1] - p2[1];
        let deltaZ = p1[2] - p2[2];
        return Math.sqrt(deltaX**2 + deltaY**2 + deltaZ**2);
    }

    /**
     * Applies brightness filter and then changes each pixel to its closest color in palette
     */
    function recolorCanvas () {
        let width = canvasRef.current.width;
        let height = canvasRef.current.height;
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;

        for(let i = 0; i < data.length; i += 4) {
            // apply brightness changes
            data[i] += options.brightness.value;
            data[i + 1] += options.brightness.value;
            data[i + 2] += options.brightness.value;
            
            if(options.isDithered.value) {
                let thresholdMapSize = thresholdMap[0].length;
                let bayerR = options.ditheringIntensity.value;
    
                // get pixel's corresponding spot on tiled threshold map
                let x = ((i / 4) % width)  % thresholdMapSize;
                let y = (((i/ 4) / width) | 0) % thresholdMapSize;
    
                // apply threshold map to all color channels of current pixel
                data[i] += bayerR * ((thresholdMap[x][y] / thresholdMapSize**2)  - 0.5);
                data[i + 1] += bayerR * ((thresholdMap[x][y] / thresholdMapSize**2) - 0.5);
                data[i + 2] += bayerR * ((thresholdMap[x][y] / thresholdMapSize**2) - 0.5);
            }

            // now find color in palette closest to pixel's value using distance formula
            let closestColor = options.palette.value[0];
            let closestColorDistance = distanceFormula([data[i], data[i+1], data[i+2]], closestColor);
            for(let j = 1; j < options.palette.value.length; j++){
                let distance = distanceFormula([data[i], data[i+1], data[i+2]], options.palette.value[j]);
                if(distance < closestColorDistance) {
                    closestColor = options.palette.value[j];
                    closestColorDistance = distance;
                }
            }

            data[i] = closestColor[0];
            data[i + 1] = closestColor[1];
            data[i + 2] = closestColor[2];
        }

        context.putImageData(imageData, 0, 0);
    }

    /**
     * Pixelates image currently on the canvas and runs it through recoloring
     */
    function processCanvas() {
        context.msImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;

        // scale down image, recolor it, and then scale it back up to achieve pixelated look
        let width = canvasRef.current.width;
        let height = canvasRef.current.height;
        let resizedWidth = Math.floor(width / options.pixelSize.value);
        let resizedHeight = Math.floor(height / options.pixelSize.value);
        context.drawImage(webcamRef.current, 0, 0, resizedWidth, resizedHeight);
        recolorCanvas();
        context.drawImage(canvasRef.current, 0, 0, resizedWidth, resizedHeight, 0, 0, width, height);

        requestRef.current = requestAnimationFrame(processCanvas);
    }

    function startProcessedFeed() {
        // adjust canvas to fit in view if it's too big
        const viewWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        if (viewWidth < webcamRef.current.videoWidth) {
            let newWidth = viewWidth - 10;
            canvasRef.current.width = newWidth;
            canvasRef.current.height = (newWidth / webcamRef.current.videoWidth) * webcamRef.current.videoHeight;
            webcamRef.current.width = canvasRef.current.width;
            webcamRef.current.height = canvasRef.current.height;
        }
        else {
            canvasRef.current.width = webcamRef.current.videoWidth;
            canvasRef.current.height = webcamRef.current.videoHeight;
        }

        requestRef.current = requestAnimationFrame(processCanvas);
    }

    // reload image processing on re-render (when options state changes)
    useEffect(() => {
        if(canvasRef.current.width > 0 && webcamRef.current.videoWidth > 0) {
            cancelAnimationFrame(requestRef.current);
            startProcessedFeed();
        }
    });

    useEffect(() => {
        if(requestRef.current === null){
            getCamera();
            setContext(canvasRef.current.getContext('2d', { willReadFrequently: true }));
        }
    }, []);

    return (
        <div className="Canvas">
            <video muted autoPlay playsInline id="video"
                ref={webcamRef}  
                hidden={options.isDithered.value}
                onCanPlay={startCamera} 
                onPlaying={startProcessedFeed} 
                />
            <canvas hidden={!options.isDithered.value} ref={canvasRef}/>
        </div>
    );
}

export default Canvas;