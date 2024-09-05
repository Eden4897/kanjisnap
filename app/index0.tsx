/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';

import {View, Text, LayoutChangeEvent, PixelRatio} from 'react-native';
import {
  useFrameProcessor,
  Camera,
  useCameraDevice,
  useCameraFormat,
  runAtTargetFps,
} from 'react-native-vision-camera';


// import {useSharedValue,} from 'react-native-worklets-core';

import {OCRFrame, scanOCR} from '@ismaelmoreiraa/vision-camera-ocr';
import { Worklets } from 'react-native-worklets-core';

export default function App() {
  
  // const frameWidthAndHeightRef = useSharedValue({height: 1, width: 1});
  
  /**
   * Camera
  */
  const [hasPermission, setHasPermission] = React.useState(false);
  const [targetFps] = useState(60);

  const [ocr, setOcr] = useState<OCRFrame>();
  const [pixelRatioW, setPixelRatioW] = React.useState<number>(1);
  const [pixelRatioH, setPixelRatioH] = React.useState<number>(1);
  const setOcrJS = Worklets.createRunOnJS(setOcr);

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    {videoResolution: 'max'},
    {photoResolution: 'max'},
  ]);

  const fps = Math.min(format?.maxFps ?? 1, targetFps);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';

    runAtTargetFps(1, () => {
      'worklet';
      const data = scanOCR(frame);
      
      setOcrJS(data);
    })
  }, []);

  const renderOverlay = () => {
    console.log(
      ocr?.result?.blocks.map(block => [block.text, JSON.stringify(block.boundingBox)]).join('\n'),
    );
    return (
      <>
        {ocr?.result.blocks.map(block => {
          if (!block.boundingBox) {
            return <View></View>;
          }
          return (
            <View
              key={block.text}
              style={{
                position: 'absolute',
                top: block.boundingBox.top * pixelRatioH,
                left: block.boundingBox.left * pixelRatioW,
                height: (block.boundingBox.bottom - block.boundingBox.top) * pixelRatioH,
                width: (block.boundingBox.right - block.boundingBox.left) * pixelRatioW,
                borderColor: 'red',
                borderWidth: 2,
              }}
            />
          )
        })}
      </>
    )
  }

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if(device !== undefined && hasPermission)
    return(
      <>
        <Camera
          style={{width: '100%', height: '100%', flex: 1}}
          frameProcessor={frameProcessor}
          device={device}
          fps={fps}
          video
          isActive={true}
          format={format}
          onLayout={(event: LayoutChangeEvent) => {
            setPixelRatioW(
              event.nativeEvent.layout.width /
                PixelRatio.getPixelSizeForLayoutSize(
                  event.nativeEvent.layout.width
                )
            );
            setPixelRatioH(
              event.nativeEvent.layout.height /
                PixelRatio.getPixelSizeForLayoutSize(
                  event.nativeEvent.layout.height
                )
            );
          }}
        >
        </Camera>
        {renderOverlay()}
      </>
    )
  else
    return(
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>No available cameras</Text>
      </View>
    )
}