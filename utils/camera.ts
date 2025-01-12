import { Camera, CameraType } from 'expo-camera';
import { PermissionResponse } from 'expo-modules-core';

export class CameraService {
  static async checkPermissions(): Promise<string> {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status;
  }

  static async requestPermissions(): Promise<PermissionResponse> {
    return await Camera.requestCameraPermissionsAsync();
  }

  static async takePicture(camera: any): Promise<string | null> {
    if (!camera) return null;
    
    try {
      const photo = await camera.takePictureAsync();
      return photo.uri;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  }
} 