import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const SERVER_URL = 'http://192.168.50.219:3001';

type ViewerParams = {
  photoPath: string;
};

interface TextBlock {
  text: string;
  confidence: number;
  boundingBox: {
    vertices: Array<{
      x: number;
      y: number;
    }>;
  };
}

interface OCRResponse {
  text: string;
  confidence: number;
  imageUrl: string;
  blocks: TextBlock[];
  imageWidth: number;
  imageHeight: number;
}

export default function ViewerScreen() {
  const { photoPath } = useLocalSearchParams<ViewerParams>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResponse | null>(null);

  useEffect(() => {
    const processImage = async () => {
      try {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', {
          uri: photoPath,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);

        const response = await axios.post(`${SERVER_URL}/ocr`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setResult(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process image');
      } finally {
        setLoading(false);
      }
    };

    if (photoPath) {
      processImage();
    }
  }, [photoPath]);

  if (!photoPath) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No image available</ThemedText>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Processing image...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !result) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>{error || 'Failed to process image'}</ThemedText>
      </ThemedView>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const scale = Math.min(
    screenWidth / result.imageWidth,
    screenHeight / result.imageHeight
  );

  

  return (
    <ThemedView style={styles.container}>
      <ReactNativeZoomableView
        maxZoom={3}
        minZoom={1}
        zoomStep={0.5}
        initialZoom={1}
        bindToBorders={true}
        style={styles.zoomView}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photoPath }}
            style={[
              styles.image,
              {
                width: result.imageWidth * scale,
                height: result.imageHeight * scale,
              },
            ]}
            resizeMode="contain"
          />
          {result.blocks.map((block, index) => {
            if (!block.boundingBox?.vertices || block.boundingBox.vertices.length < 4) {
              return null;
            }
            
            // Calculate width and height based on the actual text orientation
            const width = Math.sqrt(
              Math.pow(block.boundingBox.vertices[1].x - block.boundingBox.vertices[0].x, 2) +
              Math.pow(block.boundingBox.vertices[1].y - block.boundingBox.vertices[0].y, 2)
            );
            const height = Math.sqrt(
              Math.pow(block.boundingBox.vertices[2].x - block.boundingBox.vertices[1].x, 2) +
              Math.pow(block.boundingBox.vertices[2].y - block.boundingBox.vertices[1].y, 2)
            );

            // Calculate rotation angle
            const angle = Math.atan2(
              block.boundingBox.vertices[1].y - block.boundingBox.vertices[0].y,
              block.boundingBox.vertices[1].x - block.boundingBox.vertices[0].x
            );

            return (
              <View
                key={index}
                style={[
                  styles.textOverlay,
                  {
                    left: block.boundingBox.vertices[0].x * scale,
                    top: block.boundingBox.vertices[0].y * scale,
                    width: width * scale,
                    height: height * scale,
                    transform: [{ rotate: `${angle}rad` }],
                  },
                ]}
              >
                <ThemedText style={styles.overlayText}>{block.text}</ThemedText>
              </View>
            );
          })}
        </View>
      </ReactNativeZoomableView>
      <View style={styles.textContainer}>
        <ThemedText>Confidence: {result.confidence.toFixed(1)}%</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  zoomView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    resizeMode: 'contain',
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#28a745',
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  textContainer: {
    padding: 16,
    alignItems: 'center',
  },
});