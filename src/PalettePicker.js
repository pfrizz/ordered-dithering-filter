function PalettePicker({ palette }) {
    /**
     * Converts an RGB value to a hex color code
     * @param red int in the range [0, 255]
     * @param green int in the range [0, 255]
     * @param blue int in the range [0, 255]
     * @returns a hex color code string
     */
    function rgbToHex(red, green, blue) {
        let redHex = red.toString(16), greenHex = green.toString(16), blueHex = blue.toString(16);
        return "#" + (redHex.length === 1 ? "0" + redHex : redHex) 
                   + (greenHex.length === 1 ? "0" + greenHex : greenHex) 
                   + (blueHex.length === 1 ? "0" + blueHex : blueHex)
    }

    /**
     * Converts a hex color code to an RGB value
     * @param hex a hex color code string
     * @returns a JSON object in the form {red: #, green: #, blue: #}
     */
    function hexToRgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(result) {
            return {
                red: parseInt(result[1], 16),
                green: parseInt(result[2], 16),
                blue: parseInt(result[3], 16)
            }
        }
        else {
            return null;
        }
    }

    /**
     * Updates the state of the palette after a color picker is changed 
     * @param index the index of the changed color in the palette array 
     * @param hex the hex color code string for the new value of the changed color
     */
    function handlePaletteChange(index, hex) {
        let newPalette = [...palette.value];
        newPalette[index][0] = hexToRgb(hex).red;
        newPalette[index][1] = hexToRgb(hex).green;
        newPalette[index][2] = hexToRgb(hex).blue;
        palette.onChange(newPalette);
    }

    function addRandomColorToPalette() {
        let newPalette = [...palette.value];
        newPalette.push([Math.floor(Math.random() * 256), 
                         Math.floor(Math.random() * 256), 
                         Math.floor(Math.random() * 256)]);
        palette.onChange(newPalette);
    }
  
    function popPalette() {
        let newPalette = [...palette.value];
        newPalette.pop();
        palette.onChange(newPalette);
    }

    /**
     * Creates the collection of color pickers for the palette
     * @returns an array of JSX color input elements for each color currently in the palette
     */
    function generatePaletteInput(){
        let paletteInput = [];
        
        for(let i = 0; i < palette.value.length; i++){
            let red = palette.value[i][0];
            let green = palette.value[i][1];
            let blue = palette.value[i][2];

            paletteInput.push(
                <input key={i} type="color" 
                    defaultValue={rgbToHex(red, green, blue)} 
                    onInputCapture={(e) => {handlePaletteChange(i, e.target.value)}}/>
            )
        }

        return paletteInput;
    }

    return (
        <div>
            <label htmlFor="palette-values">
                Current color palette:
            </label>
            <div id="palette-values">
                {generatePaletteInput()}
            </div>
            <button onClick={addRandomColorToPalette}>
                + Add color
            </button>
            <button disabled={palette.value.length <= 2}
                onClick={popPalette}>
                - Remove color
            </button>
        </div>
    )
}

export default PalettePicker;