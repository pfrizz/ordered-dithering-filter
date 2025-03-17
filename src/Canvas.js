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
     * Calculates the adjustment to be applied to a given pixel based on its corresponding
     * spot on the tiled threshold map
     * @param {Number} index the index of the pixel in the image data array
     * @return the adjustment value from the Bayer matrix for the given index 
     */
    function getThresholdAdjustment(index) {
        let width = canvasRef.current.width;
        let thresholdMapSize = thresholdMap[0].length;
        let bayerR = options.ditheringIntensity.value;

        let x = (index % width)  % thresholdMapSize;
        let y = ((index / width) | 0) % thresholdMapSize;

        return bayerR * ((thresholdMap[x][y] / thresholdMapSize**2)  - 0.5);
    }

    /**
     * Calculates the distance between two points in 3-D space
     * @param {Number[]} p1 point in the form [x1, y1, z1]
     * @param {Number[]} p2 point in the form [x2, y2, z2]
     * @returns the distance between the two points
     */
    function distanceFormula(p1, p2) {
        let deltaX = p1[0] - p2[0];
        let deltaY = p1[1] - p2[1];
        let deltaZ = p1[2] - p2[2];
        return Math.sqrt(deltaX**2 + deltaY**2 + deltaZ**2);
    }


    /**
     * Finds the closest color in the current palette to any given color
     * @param {Number[]} pixelColor an array representing the rgb values of a pixel
     * @returns the closest color to the pixel in the palette in the form [red, green, blue]
     */
    function findClosestColor([red, green, blue]) {
        let closestColor = options.palette.value[0];
        let closestColorDistance = distanceFormula([red, green, blue], closestColor);

        for(let i = 1; i < options.palette.value.length; i++){
            let distance = distanceFormula([red, green, blue], options.palette.value[i]);
            if(distance < closestColorDistance) {
                closestColor = options.palette.value[i];
                closestColorDistance = distance;
            }
        }

        return closestColor;
    }

    /**
     * Apply brightness, dithering, and palette to image currently on canvas
     */
    function recolorCanvas() {
        let width = canvasRef.current.width;
        let height = canvasRef.current.height;
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;

        for(let i = 0; i < data.length; i += 4) {
            let pixelIndex = i / 4;
            let recoloredPixel = [data[i], data[i + 1], data[i + 2]];

            recoloredPixel = recoloredPixel.map(colorChannel => colorChannel + options.brightness.value);
            if(options.isDithered.value) {
                recoloredPixel = recoloredPixel.map(colorChannel => colorChannel + getThresholdAdjustment(pixelIndex));
            }
            recoloredPixel = findClosestColor(recoloredPixel);

            [data[i], data[i + 1], data[i + 2]] = recoloredPixel
        }

        context.putImageData(imageData, 0, 0);
    }

    /**
     * Applies image processing to canvas and creates animation loop 
     */
    function drawProcessedFrame() {
        context.msImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;

        let width = canvasRef.current.width;
        let height = canvasRef.current.height;
        let resizedWidth = Math.floor(width / options.pixelSize.value);
        let resizedHeight = Math.floor(height / options.pixelSize.value);

        // scale down image, recolor it, and then scale it back up to achieve pixelated look
        context.drawImage(webcamRef.current, 0, 0, resizedWidth, resizedHeight);
        recolorCanvas();
        context.drawImage(canvasRef.current, 0, 0, resizedWidth, resizedHeight, 0, 0, width, height);

        requestRef.current = requestAnimationFrame(drawProcessedFrame);
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

        requestRef.current = requestAnimationFrame(drawProcessedFrame);
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