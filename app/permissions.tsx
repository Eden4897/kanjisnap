import { Stack, useRouter } from "expo-router";
import * as React from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  TouchableHighlight,
  View,
} from "react-native";


import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraPermissionStatus } from "react-native-vision-camera";

const ICON_SIZE = 26;

export default function PermissionsScreen() {
  const router = useRouter();
  const [cameraPermissionStatus, setCameraPermissionStatus] =
    React.useState<CameraPermissionStatus>("not-determined");

  // const [mediaLibraryPermission, requestMediaLibraryPermission] =
  //   ExpoMediaLibrary.usePermissions();

  const requestCameraPermission = async () => {
    const permission = await Camera.requestCameraPermission();
    setCameraPermissionStatus(permission);
  };

  const handleContinueButton = () => {
    if (
      cameraPermissionStatus === "granted" 
      // &&
      // mediaLibraryPermission?.granted
    ) {
      router.replace("/");
    } else {
      Alert.alert("Please go to settings and enable permissions");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Permissions", headerShown: false}} />
      <ThemedView style={styles.container}>
        <View style={styles.spacer} />

        <ThemedText type="subtitle" style={styles.subtitle}>
          Kanjisnap needs access to some permissions to work properly.
        </ThemedText>

        <View style={styles.spacer} />

        <View style={styles.row}>
          <Ionicons
            name="lock-closed-outline"
            color={"orange"}
            size={ICON_SIZE}
          />
          <ThemedText style={styles.footnote}>REQUIRED</ThemedText>
        </View>

        <View style={styles.spacer} />

        <View
          style={StyleSheet.compose(styles.row, styles.permissionContainer)}
        >
          <Ionicons name="camera-outline" color={"gray"} size={ICON_SIZE} style={styles.icon} />
          <View style={styles.permissionText}>
            <ThemedText type="subtitle">Camera</ThemedText>
            <ThemedText>Used for taking photos and videos.</ThemedText>
          </View>
          <Switch
            trackColor={{ true: "orange" }}
            value={cameraPermissionStatus === "granted"}
            onChange={requestCameraPermission}
          />
        </View>

        <View style={styles.spacer} />

        {/* <View
          style={StyleSheet.compose(styles.row, styles.permissionContainer)}
        >
          <Ionicons name="library-outline" color={"gray"} size={ICON_SIZE} style={styles.icon} />
          <View style={styles.permissionText}>
            <ThemedText type="subtitle">Library</ThemedText>
            <ThemedText>Used for saving, viewing and more.</ThemedText>
          </View>
          <Switch
            trackColor={{ true: "orange" }}
            value={mediaLibraryPermission?.granted}
            // @ts-ignore
            onChange={async () => await requestMediaLibraryPermission()}
          />
        </View> */}

        <View style={styles.spacer} />
        <View style={styles.spacer} />
        <View style={styles.spacer} />

        <TouchableHighlight
          onPress={handleContinueButton}
          style={StyleSheet.compose(styles.row, styles.continueButton)}
        >
          <Ionicons
            name="arrow-forward-outline"
            color={"grey"}
            size={ICON_SIZE}
          />
        </TouchableHighlight>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  subtitle: {
    textAlign: "center",
  },
  footnote: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  spacer: {
    marginVertical: 8,
  },
  permissionContainer: {
    backgroundColor: "#ffffff20",
    borderRadius: 10,
    padding: 10,
    justifyContent: "space-between",
  },
  permissionText: {
    flexShrink: 1,
  },
  continueButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: "grey",
    borderRadius: 50,
    alignSelf: "center",
  },
  icon: {
    margin: 20
  }
});