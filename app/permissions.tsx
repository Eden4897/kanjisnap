import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { TouchableHighlight } from "react-native";
import { useCameraPermissions } from 'expo-camera';

export default function PermissionsPage() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  React.useEffect(() => {
    if (permission?.granted) {
      router.replace("/");
    }
  }, [permission, router]);

  return (
    <ThemedView style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Stack.Screen options={{ title: "Camera Permissions" }} />
      <ThemedText style={{fontSize: 18, marginBottom: 20, textAlign: 'center', paddingHorizontal: 20}}>
        We need camera access to scan kanji characters.
      </ThemedText>
      <TouchableHighlight 
        onPress={requestPermission}
        style={{
          backgroundColor: '#007AFF',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8
        }}
      >
        <ThemedText style={{color: 'white', fontSize: 16}}>
          Grant Camera Permission
        </ThemedText>
      </TouchableHighlight>
    </ThemedView>
  );
}