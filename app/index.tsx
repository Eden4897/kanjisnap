import { ThemedView } from "@/components/ThemedView";
import { DarkTheme } from "@react-navigation/native";
import { Redirect, Stack, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { Camera, CameraDevice, useCameraDevice, useCameraPermission } from "react-native-vision-camera";

export default function HomePage(){
  const { hasPermission } = useCameraPermission();
  const redirectToPermissions = !hasPermission

  const [device, setDevice] = React.useState<'front'|'back'>('back')
  
  const camera = React.useRef<Camera>(null);
  const router = useRouter();

  if(redirectToPermissions){
    return <Redirect href={"/permissions"} />
  }
  if (!device)
    return(
      <ThemedView style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text>No available cameras</Text>
      </ThemedView>
    )


  const takePicture = async () => {
    try{
      if (camera.current == null) return alert("Camera is not found");
      const photo = await camera.current.takePhoto({
        enableShutterSound: true
      })
      router.push({
        pathname: "/viewer",
        params: {photoPath: photo.path}
      })
    } catch(e) {
      console.error(e)
      alert(`Error encountered: \n\n${e}`);
    }
  }

  return (
    <View style = {styles.container}>
      <Stack.Screen options={{ title: "Home Page", headerShown: false }} />
      <View style={{flex:6, borderRadius: 30, overflow: "hidden"}}>
        <Camera 
          style={{flex:1}} 
          device={useCameraDevice(device) as CameraDevice} 
          isActive 
          ref={camera} 
          photo
          enableZoomGesture
        >
          <View>
            <Text>
              {camera.current?.props.zoom}
            </Text>
          </View>
        </Camera>
      </View>
      <View style={{flex:1, alignItems: "center", flexDirection: "row", justifyContent: "space-evenly"}}>
        <TouchableHighlight style={styles.iconContainer} onPress={takePicture}>
          <></>
        </TouchableHighlight>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  iconContainer: {
    borderRadius: 50,
    width: 90,
    height: 90,
    padding: 15,
    backgroundColor: "white",
  },
})

import {
  getUnhandledPromiseRejectionTracker,
  setUnhandledPromiseRejectionTracker,
} from 'react-native-promise-rejection-utils';
 
const prevTracker = getUnhandledPromiseRejectionTracker()
 
setUnhandledPromiseRejectionTracker((id, error) => {
  console.warn('Unhandled promise rejection!', id, error)
 
  if (prevTracker !== undefined) {
    prevTracker(id, error)
  }
})