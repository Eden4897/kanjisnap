import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { DarkTheme } from "@react-navigation/native";
import { Redirect, Stack, useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Platform, StatusBar, Touchable, TouchableHighlight, LayoutChangeEvent, PixelRatio } from "react-native";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";

export default function HomePage(){
  const [pixelRatio, setPixelRatio] = React.useState(1);

  const { hasPermission } = useCameraPermission();
  const redirectToPermissions = !hasPermission

  const device = useCameraDevice('back');
  
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
      console.log('taking photo')
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
    <ThemedView style = {styles.container}>
      <Stack.Screen options={{ title: "Home Page", headerShown: false }} />
      <View style={{flex:6, borderRadius: 30, overflow: "hidden"}}>
        <Camera 
          style={{flex:1}} 
          device={device} 
          isActive 
          ref={camera} 
          photo
          onLayout={(event: LayoutChangeEvent) => {
            setPixelRatio(
              event.nativeEvent.layout.width /
                PixelRatio.getPixelSizeForLayoutSize(
                  event.nativeEvent.layout.width
                )
            );
          }}>
        </Camera>
      </View>
      <View style={{flex:1, alignItems: "center", flexDirection: "row", justifyContent: "space-evenly"}}>
        <TouchableHighlight style={styles.iconContainer} onPress={takePicture}>
          <></>
        </TouchableHighlight>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    backgroundColor: DarkTheme.dark ? "white": "grey",
    borderRadius: 50,
    width: 90,
    height: 90,
    padding: 15,
  },
})