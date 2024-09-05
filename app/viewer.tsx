import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { DimensionValue, Image, StyleSheet, TouchableHighlight, View, Text} from "react-native";
import TextRecognition, { TextBlock, TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
import React, { useEffect } from "react";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

export default function ViewerScreen(){
  const {photoPath} = useLocalSearchParams();
  const [blocks, setBlocks] = React.useState<TextBlock[]>([])
  const [dimensions, setDimensions] = React.useState({width: 0, height: 0})

  const router = useRouter();

  const handleReturnButton = () => {
    router.push({pathname: "/"})
  }
  
  useEffect(
    () => {
      console.log(photoPath)
      Image.getSize(`file://${photoPath}`, (width, height) => {
        setDimensions({width, height})
        console.log(`Image dimensions: ${width} x ${height}`)
      })
      console.log("Recognizing text")
      TextRecognition.recognize(`file://${photoPath}`, 
        TextRecognitionScript.JAPANESE
      ).then((result) => {
        setBlocks(result.blocks)
        for (let block of result.blocks) {
          for (let line of block.lines) {
            console.log(`${line.text}  |  ${JSON.stringify(line.frame)}`);
          }
        }
      })
    }, []
  )

  const renderOverlay = () => {
    let components = []
    for (let block of blocks) {
      for (let line of block.lines) {
        components.push(
          <View style={{
            position: 'absolute',
            top: (line.frame!.top / dimensions.height * 100 + '%') as DimensionValue,
            left: (line.frame!.left / dimensions.width * 100 + '%') as DimensionValue,
            width: (line.frame!.width / dimensions.width * 100 + '%') as DimensionValue,
            height: (line.frame!.height / dimensions.height * 100 + '%') as DimensionValue,
            backgroundColor: 'grey',
            opacity: 0.9,
            padding: 0,
            borderRadius: 6,
          }} key={Math.random()}>
            <Text style={{
                color: 'white',
                fontSize: 14,
                justifyContent: 'center',
                textAlign: 'center',
                alignItems: 'center',
              }}>
              {line.text.replaceAll(/[|]/g, '')}
            </Text>
          </View>
        )
      }
    }
    return (
      <>
        {components}
      </>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Home Page", headerShown: false }} />
      <View style={{borderRadius: 30, overflow: "hidden", flex: 6}}>
        <ReactNativeZoomableView
          maxZoom={6}
          minZoom={1}
        >
          <View style={{borderRadius: 30, overflow: "hidden", width: "100%", height: "100%"}}>
            <Image
              source={{ uri: `file://${photoPath}` }}
              style={{ width: "100%", height: "100%", resizeMode: "stretch" }}
              />
          </View>
          {renderOverlay()}
        </ReactNativeZoomableView>
      </View>
      <View style={{flex: 1, justifyContent: "center", flexDirection: "row", alignItems: "center"}}>
        <TouchableHighlight style={{padding: 20, backgroundColor: "grey", height: 100, borderRadius: 50}} onPress={handleReturnButton}>
          <Ionicons name="arrow-back-outline" size={60} color="white"/>
        </TouchableHighlight>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 40,
  },
});