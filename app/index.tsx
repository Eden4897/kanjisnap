import { ThemedView } from "@/components/ThemedView";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CameraService } from "@/utils/camera";

export default function HomePage() {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = React.useRef<any>(null);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (permission === null) return;
    if (!permission.granted) {
      router.replace("/permissions");
    }
  }, [permission, router]);

  if (!permission || !permission.granted) {
    return null;
  }

  const takePicture = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (camera.current == null) throw new Error("Camera not initialized");
      const photoUri = await CameraService.takePicture(camera.current);
      if (!photoUri) throw new Error("Failed to take photo");
      router.push({
        pathname: "/viewer",
        params: {photoPath: photoUri}
      });
    } catch(e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to take photo");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Home Page", headerShown: false }} />
      <View style={{flex:6, borderRadius: 30, overflow: "hidden"}}>
        <CameraView 
          style={{flex:1}} 
          facing="back"
          ref={camera}
        >
          <View>
            <Text style={{color: 'white'}}>
              {isLoading ? "Taking picture..." : ""}
              {error ? error : ""}
            </Text>
          </View>
        </CameraView>
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
    backgroundColor: "black",
    flex: 1,
  },
  iconContainer: {
    backgroundColor: "white",
    borderRadius: 50,
    height: 90,
    padding: 15,
    width: 90,
  },
});