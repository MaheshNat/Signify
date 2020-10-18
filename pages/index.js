import { useEffect, useRef, useState } from 'react';
import service from '../services/service';
import 'bootswatch/dist/darkly/bootstrap.min.css';

// We'll limit the processing size to 200px.
const maxVideoSize = 224;
const LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '_NOTHING',
  '_SPACE',
];
const THRESHOLD = 6;

/**
 * What we're going to render is:
 *
 * 1. A video component so the user can see what's on the camera.
 *
 * 2. A button to generate an image of the video, load OpenCV and
 * process the image.
 *
 * 3. A canvas to allow us to capture the image of the video and
 * show it to the user.
 */
export default function Page() {
  const videoElement = useRef(null);
  const canvasEl = useRef(null);
  const outputCanvasEl = useRef(null);
  let [letter, setLetter] = useState(null);
  let [loading, setLoading] = useState(true);
  let [confidence, setConfidence] = useState(0);
  let [fps, setFps] = useState(0);
  let [words, setWords] = useState('');

  /**
   * In the onClick event we'll capture a frame within
   * the video to pass it to our service.
   */
  async function processImage() {
    if (
      videoElement !== null &&
      canvasEl !== null &&
      typeof videoElement.current !== 'undefined' &&
      videoElement.current !== null
    ) {
      let frames = 0;
      let start = Date.now();
      let prevLetter = '';
      let count = 0;
      while (true) {
        const ctx = canvasEl.current.getContext('2d');
        ctx.drawImage(videoElement.current, 0, 0, maxVideoSize, maxVideoSize);
        const image = ctx.getImageData(0, 0, maxVideoSize, maxVideoSize);
        // Processing image
        const processedImage = await service.imageProcessing(image);
        // Render the processed image to the canvas
        const ctxOutput = outputCanvasEl.current.getContext('2d');
        ctxOutput.putImageData(processedImage.data.payload, 0, 0);

        const prediction = await service.predict(processedImage.data.payload);

        const [predictedLetter, confidence] = prediction.data.payload;
        const letterValue = LETTERS[predictedLetter];

        setLetter(letterValue);
        if (letterValue !== prevLetter) {
          if (count > THRESHOLD)
            setWords(
              (state, props) =>
                state +
                (prevLetter === '_NOTHING'
                  ? ''
                  : prevLetter === '_SPACE'
                  ? ' '
                  : prevLetter)
            );
          count = 0;
        } else {
          count++;
        }
        prevLetter = letterValue;
        // speechSynthesis.speak(
        //   new SpeechSynthesisUtterance(letter)
        // );
        setConfidence(confidence);
        frames++;
        if (frames === 10) {
          setFps(10 / ((Date.now() - start) / 1000));
          frames = 0;
          start = Date.now();
        }
      }
    }
  }

  /**
   * In the useEffect hook we'll load the video
   * element to show what's on camera.
   */
  useEffect(() => {
    async function initCamera() {
      videoElement.current.width = maxVideoSize;
      videoElement.current.height = maxVideoSize;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
            width: maxVideoSize,
            height: maxVideoSize,
          },
        });
        videoElement.current.srcObject = stream;

        return new Promise((resolve) => {
          videoElement.current.onloadedmetadata = () => {
            resolve(videoElement.current);
          };
        });
      }
      const errorMessage =
        'This browser does not support video capture, or this device does not have a camera';
      alert(errorMessage);
      return Promise.reject(errorMessage);
    }

    async function load() {
      const videoLoaded = await initCamera();
      await service.load();
      videoLoaded.play();
      setTimeout(processImage, 0);
      setLoading(false);
      return videoLoaded;
    }

    load();
  }, []);

  return (
    <div className="container" style={{ marginTop: '2em' }}>
      <div className="jumbotron text-center">
        <h1>Signify - ASL Made Easy.</h1>
        <p>
          A simple sign language translator using machine learning to classify
          signs by a convolutional neural network.
        </p>
      </div>
      {loading && <h1 className="text-center">Loading...</h1>}
      <div style={{ display: loading ? 'none' : 'block' }}>
        <div className="row justify-content-center">
          <video className="video col-xs-12" playsInline ref={videoElement} />
          <canvas
            style={{ display: 'none' }}
            ref={canvasEl}
            width={maxVideoSize}
            height={maxVideoSize}
          ></canvas>
          <canvas
            className="col-xs-12"
            ref={outputCanvasEl}
            width={maxVideoSize}
            height={maxVideoSize}
          ></canvas>
        </div>
        <div
          className="row justify-content-center text-center"
          style={{ marginTop: '2em' }}
        >
          <div className="col-xs-12">
            <h2>Predicted Letter:</h2>
            <h1
              style={{
                borderRadius: 10,
                border: '2px solid #FFFFFF',
                padding: '1em',
              }}
            >
              {letter}
            </h1>
          </div>
        </div>
        <div
          className="row justify-content-center text-center"
          style={{ marginTop: '2em' }}
        >
          <div className="col-xs-12">
            <h2>Predicted Words:</h2>
            <h1
              style={{
                borderRadius: 10,
                border: '2px solid #FFFFFF',
                padding: '1em',
              }}
            >
              {words}
            </h1>
            <h4>Confidence: {confidence.toFixed(3)}</h4>
            <h4>FPS: {fps.toFixed(3)}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
