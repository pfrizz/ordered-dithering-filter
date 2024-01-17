import { useState } from 'react';
import './App.css';
import Canvas from './Canvas';
import Options from './Options';

function App() {
  const [pixelSize, setPixelSize] = useState(2);
  const [brightness, setBrightness] = useState(0);
  const [isDithered, setIsDithered] = useState(true);
  const [thresholdMap, setThresholdMap] = useState(generateThresholdMap(3));
  const [ditheringIntensity, setDitheringIntensity] = useState(50);
  const [palette, setPalette] = useState([[0, 0, 0], [255, 255, 255], [255, 0, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [255, 0, 255]]);

  const options = {pixelSize: pixelSize, brightness: brightness, isDithered: isDithered, thresholdMap: thresholdMap, ditheringIntensity: ditheringIntensity, palette: palette};
  const changeHandlers = {handleBrightnessChange: handleBrightnessChange, 
                          handlePixelSizeChange: handlePixelSizeChange,
                          handleThresholdMapSizeChange: handleThresholdMapSizeChange,
                          handleIsDitheredChange: handleIsDitheredChange,
                          handlePaletteChange: handlePaletteChange,
                          handlePaletteSizeIncrease: handlePaletteSizeIncrease,
                          handlePaletteSizeDecrease: handlePaletteSizeDecrease,
                          handleDitheringIntensityChange: handleDitheringIntensityChange};

  // a recursive function to generate a bayer threshold map of size n
  function generateThresholdMap(n) {
    const baseThresholdMap = [[0, 2], [3, 1]];
    if(n === 0){
      return baseThresholdMap;
    }
    else{
      var thresholdMap = [...Array(2**(n+1))].map(() => Array(2**(n+1)).fill(0));
      var previousThresholdMap = generateThresholdMap(n - 1);
      for(let i = 0; i < thresholdMap.length; i++){
        for(let j = 0; j < thresholdMap[i].length; j++){
          let quadrantX = ((i / 2**n) >= 1 ? 1 : 0)
          let quadrantY = ((j / 2**n) >= 1 ? 1 : 0);

          thresholdMap[i][j] = 4 * previousThresholdMap[i % 2**n][j % 2**n] + baseThresholdMap[quadrantX][quadrantY];
        }
      }
      return thresholdMap;
    }
  }

  function handlePixelSizeChange(value) {
    setPixelSize(value);
  }

  function handleBrightnessChange(value) {
    setBrightness(value);
  }

  function handleThresholdMapSizeChange(value){
    console.log(Math.log2(thresholdMap.length) - 1)
    let newSize = Math.log2(thresholdMap.length) - 1 + value;
    setThresholdMap(generateThresholdMap(newSize));
  }

  function handleIsDitheredChange(value){
    setIsDithered(value);
  }

  function handlePaletteChange(index, red, green, blue) {
    let newPalette = [...palette];
    newPalette[index][0] = red;
    newPalette[index][1] = green;
    newPalette[index][2] = blue;

    setPalette(newPalette);
  }

  function handlePaletteSizeIncrease() {
    let newPalette = [...palette];
    newPalette.push([0, 0, 0]);

    setPalette(newPalette);
  }

  function handlePaletteSizeDecrease() {
    let newPalette = [...palette];
    newPalette.pop();

    setPalette(newPalette);
  }

  function handleDitheringIntensityChange(value) {
    setDitheringIntensity(value);
  }

  return (
    <div className="App">
      <div className="main-app">
        <Canvas options={options} />
        <Options changeHandlers={changeHandlers} options={options}/>
      </div>
      <div className="footer">
        <p>View source on GitHub</p>
      </div>
    </div>
  );
}

export default App;
