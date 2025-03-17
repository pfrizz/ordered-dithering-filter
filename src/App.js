import { useState } from 'react';
import './App.css';
import Canvas from './Canvas';
import Options from './Options';
import * as constants from './Constants';

function App() {
  const [brightness, setBrightness] = useState(constants.DEFAULT_BRIGHTNESS);
  const [pixelSize, setPixelSize] = useState(constants.DEFAULT_PIXEL_SIZE);
  const [ditheringIntensity, setDitheringIntensity] = useState(constants.DEFAULT_DITHERING_INTENSITY);
  const [isDithered, setIsDithered] = useState(constants.DEFAULT_IS_DITHERED);
  const [thresholdMapN, setThresholdMapN] = useState(constants.DEFAULT_THRESHOLD_MAP_N);
  const [palette, setPalette] = useState(constants.DEFAULT_PALETTE);

  const options = {
    brightness: { value: brightness, onChange: setBrightness },
    pixelSize: { value: pixelSize, onChange: setPixelSize },
    isDithered: { value: isDithered, onChange: setIsDithered },
    ditheringIntensity: { value: ditheringIntensity, onChange: setDitheringIntensity },
    thresholdMapN: { value: thresholdMapN, onChange: setThresholdMapN },
    palette: { value: palette, onChange: setPalette }
  };

  return (
    <div className="App">
      <div className="main-app">
        <Canvas options={options} />
        <Options options={options}/>
      </div>
      <div className="footer">
        <p><a href="https://github.com/pfrizz/ordered-dithering-filter/" target="_blank" rel="noreferrer">View source on GitHub</a></p>
      </div>
    </div>
  );
}

export default App;
