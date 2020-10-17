function predict({ msg, payload }) {
  // // const begin2 = Date.now();
  // const tensor = tf.concat(
  //   payload.map((image) =>
  //   tf.browser
  //     .fromPixels(image)
  //     .sub(tf.tensor1d([103.939, 116.779, 123.68]))
  //     .expandDims()
  // )
  // );
  // // console.log(
  // //   'parsing of image data into tensor done in:',
  // //   (Date.now() - begin2) / 1000
  // // );
  // const begin3 = Date.now();
  // 0;
  // const prediction = model.predict(tensor);
  // // console.log('prediction done in:', (Date.now() - begin3) / 1000);;
  // // const begin4 = Date.now();
  // const predictedLetter = prediction.argMax(1).dataSync();
  // // console.log('argmax of data done in:', (Date.now() - begin4) / 1000);
  // console.log(predictedLetter);
  // // const begin5 = Date.now();
  // const confidence = prediction.dataSync()[0];
  // postMessage({ msg, payload: [predictedLetter, confidence] });
  // // console.log('confidence retrieved in:', (Date.now() - begin5) / 1000);
  // prediction.data().then((data) => {
  //   const confidence = data[predictedLetter];
  //   postMessage({ msg, payload: [predictedLetter, confidence] });
  // });
  const tensor = tf.browser
    .fromPixels(payload)
    .div(tf.scalar(127.5))
    .sub(tf.scalar(1))
    .expandDims();
  // const tensor = tf.browser
  //   .fromPixels(payload)
  //   .sub(tf.tensor1d([103.939, 116.779, 123.68]))
  //   .expandDims();
  const prediction = model.predict(tensor);
  const predictedLetter = prediction.argMax(1).dataSync();
  const confidence = prediction.dataSync()[0];
  postMessage({ msg, payload: [predictedLetter, confidence] });
  tensor.dispose();
  prediction.dispose();
}

/**
 * With OpenCV we have to work the images as cv.Mat (matrices),
 * so the first thing we have to do is to transform the
 * ImageData to a type that openCV can recognize.
 */
function imageProcessing({ msg, payload }) {
  const img = cv.matFromImageData(payload);
  let result = new cv.Mat();

  cv.cvtColor(img, result, cv.COLOR_BGR2GRAY);
  cv.adaptiveThreshold(
    result,
    result,
    255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY,
    21,
    2
  );
  // You can try more different parameters
  cv.cvtColor(result, result, cv.COLOR_GRAY2RGB);

  postMessage({ msg, payload: imageDataFromMat(result) });
}

/**
 * This function is to convert again from cv.Mat to ImageData
 */
function imageDataFromMat(mat) {
  // convert the mat type to cv.CV_8U
  const img = new cv.Mat();
  const depth = mat.type() % 8;
  const scale =
    depth <= cv.CV_8S ? 1.0 : depth <= cv.CV_32S ? 1.0 / 256.0 : 255.0;
  const shift = depth === cv.CV_8S || depth === cv.CV_16S ? 128.0 : 0.0;
  mat.convertTo(img, cv.CV_8U, scale, shift);

  // convert the img type to cv.CV_8UC4
  switch (img.type()) {
    case cv.CV_8UC1:
      cv.cvtColor(img, img, cv.COLOR_GRAY2RGBA);
      break;
    case cv.CV_8UC3:
      cv.cvtColor(img, img, cv.COLOR_RGB2RGBA);
      break;
    case cv.CV_8UC4:
      break;
    default:
      throw new Error(
        'Bad number of channels (Source image must have 1, 3 or 4 channels)'
      );
  }
  const clampedArray = new ImageData(
    new Uint8ClampedArray(img.data),
    img.cols,
    img.rows
  );
  img.delete();
  return clampedArray;
}

/**
 *  Here we will check from time to time if we can access the OpenCV
 *  functions. We will return in a callback if it has been resolved
 *  well (true) or if there has been a timeout (false).
 */
function waitForScripts(callbackFn, waitTimeMs = 30000, stepTimeMs = 100) {
  if (cv.Mat) callbackFn(true);

  let timeSpentMs = 0;
  const interval = setInterval(() => {
    const limitReached = timeSpentMs > waitTimeMs;
    if (cv.Mat || limitReached) {
      clearInterval(interval);
      return callbackFn(!limitReached);
    } else {
      timeSpentMs += stepTimeMs;
    }
  }, stepTimeMs);
}

/**
 * This exists to capture all the events that are thrown out of the worker
 * into the worker. Without this, there would be no communication possible
 * with our project.
 */
onmessage = function (e) {
  switch (e.data.msg) {
    case 'load': {
      // Import Webassembly script
      self.importScripts('./opencv.js');
      self.importScripts(
        'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.6.0/dist/tf.min.js'
      );
      // tf.setBackend('cpu');
      // console.log(tf.getBackend());
      waitForScripts(async function (success) {
        if (success) {
          self.model = await tf.loadLayersModel(
            // '../modelv3.2raw_tfjs/model.json'
            '../modelv4alpha2.2raw_tfjs/model.json'
          );
          postMessage({ msg: e.data.msg });
          console.log(tf.getBackend());
        } else throw new Error('Error on loading OpenCV');
      });
      break;
    }
    case 'imageProcessing':
      return imageProcessing(e.data);
    case 'predict':
      return predict(e.data);
    default:
      break;
  }
};
