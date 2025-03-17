import PalettePicker from "./PalettePicker";
import * as constants from "./Constants";

function Options({ options }) {
    return (
        <div className="Options">
            <div className="slider">
                <div>
                    <label htmlFor="brightness-slider">
                        Brightness:
                    </label>
                    <input id="brightness-slider" type="range"
                        min="-255" max="255" defaultValue={constants.DEFAULT_BRIGHTNESS}
                        onChangeCapture={(e) => { options.brightness.onChange(Number(e.target.value)) }} />
                </div>
                {options.brightness.value >= 0 ? "+" + options.brightness.value : options.brightness.value}
            </div>

            <div className="slider">
                <div>
                    <label htmlFor="pixel-size-slider">
                        Pixel size:
                    </label>
                    <input id="pixel-size-slider" type="range"
                        min="1" max="10" defaultValue={constants.DEFAULT_PIXEL_SIZE}
                        onChangeCapture={(e) => { options.pixelSize.onChange(Number(e.target.value)) }} />
                </div>
                {options.pixelSize.value} px
            </div>

            <div>
                <label htmlFor="dithering-checkbox">
                    Toggle dithering:
                </label>
                <input id="dithering-checkbox" type="checkbox" defaultChecked={constants.DEFAULT_IS_DITHERED}
                    onChange={(e) => { options.isDithered.onChange(e.target.checked) }} />
            </div>

            <div className="slider">
                <label htmlFor="dithering-intensity">
                    Dithering intensity:
                </label>
                <input id="dithering-intensity" type="range"
                    min="0" max="255" step="1" defaultValue={constants.DEFAULT_DITHERING_INTENSITY}
                    onChangeCapture={(e) => { options.ditheringIntensity.onChange(Number(e.target.value)) }} />
            </div>

            <div>
                <label>
                    Threshold map n = {options.thresholdMapN.value}
                </label>
                <button disabled={options.thresholdMapN.value >= 10}
                    onClick={() => { options.thresholdMapN.onChange(options.thresholdMapN.value + 1) }}>
                    +
                </button>
                <button
                    disabled={options.thresholdMapN.value <= 0}
                    onClick={() => { options.thresholdMapN.onChange(options.thresholdMapN.value - 1) }}>
                    -
                </button>
            </div>

            <PalettePicker palette={options.palette} />
        </div>
    )
}

export default Options;