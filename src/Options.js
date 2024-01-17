function Options(props) {
    function getBrightnessLabel() {
        return props.options.brightness >= 0 ? "+" + props.options.brightness : props.options.brightness;;
    }

    function generatePaletteInput(){
        function componentToHex(color) {
            var hex = color.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }
            
        function rgbToHex(red, green, blue) {
            return "#" + componentToHex(red) + componentToHex(green) + componentToHex(blue);
        }

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
              red: parseInt(result[1], 16),
              green: parseInt(result[2], 16),
              blue: parseInt(result[3], 16)
            } : null;
        }
          
        let paletteInput = [];
        
        for(let i = 0; i < props.options.palette.length; i++){
            let red = props.options.palette[i][0];
            let blue = props.options.palette[i][1];
            let green = props.options.palette[i][2];

            paletteInput.push(
                <input key={i} type="color" 
                    defaultValue={rgbToHex(red, green, blue)} 
                    onInputCapture={(e) => {props.changeHandlers.handlePaletteChange(i, hexToRgb(e.target.value).red, hexToRgb(e.target.value).green, hexToRgb(e.target.value).blue)}}/>
            )
        }

        return paletteInput;
    }


    return (
        <div className="Options">
            <div className='brightness-slider'>
                <div>
                    <label htmlFor="brightness-slider">
                        Brightness:
                    </label>
                    <input id="brightness-slider" type="range" 
                        min="-255" max="255" defaultValue="0" 
                        onChangeCapture={(e) =>{props.changeHandlers.handleBrightnessChange(Number(e.target.value))}}/>
                </div>
                {getBrightnessLabel()}
            </div>

            <div className='pixel-size-slider'>
                <div>
                    <label htmlFor="pixel-size-slider">
                        Pixel size:
                    </label>
                    <input id="pixel-size-slider" type="range" 
                        min="1" max="10" defaultValue="2" 
                        onChangeCapture={(e) =>{props.changeHandlers.handlePixelSizeChange(Number(e.target.value))}}/>
                </div>
                {props.options.pixelSize} px
            </div>   

            <div>
                <label htmlFor="dithering-checkbox">
                    Toggle dithering:
                </label>
                <input id="dithering-checkbox" type="checkbox" defaultChecked={true} 
                    onChange={(e) =>{props.changeHandlers.handleIsDitheredChange(e.target.checked)}}/>

                <br/>

                <label htmlFor="dithering-intensity">
                    Dithering intensity:
                </label>
                <input id="dithering-intensity" type="range" 
                    min="0" max="255" step = "1" defaultValue="50" 
                    onChangeCapture={(e) =>{props.changeHandlers.handleDitheringIntensityChange(Number(e.target.value))}}/>
            </div>

            <div>
                <label htmlFor="threshold-map-size" >
                    Threshold map n = {Math.log2(props.options.thresholdMap.length) - 1}
                </label>
                <button disabled={Math.log2(props.options.thresholdMap.length) - 1 >= 10} 
                    onClick={(e) => {props.changeHandlers.handleThresholdMapSizeChange(1)}}>
                        +
                </button>
                <button 
                    disabled={Math.log2(props.options.thresholdMap.length) - 1 <= 0} 
                    onClick={(e) => {props.changeHandlers.handleThresholdMapSizeChange(-1)}}>
                        -
                </button>
            </div>

            <div>
                <label htmlFor="palette-values">
                    Current color palette:
                </label>
                <div id="palette-values">
                    {generatePaletteInput()}
                </div>
                <button onClick={props.changeHandlers.handlePaletteSizeIncrease}>
                    + Add color
                </button>
                <button disabled={props.options.palette.length <= 2} onClick={props.changeHandlers.handlePaletteSizeDecrease}>
                    - Remove color
                </button>
            </div>
        </div>
    )
}

export default Options;