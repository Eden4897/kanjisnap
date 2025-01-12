import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { DimensionValue, Image, StyleSheet, TouchableHighlight, View, Text} from "react-native";
import TextRecognition, { TextBlock, TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
import React, { useEffect } from "react";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { analyse } from "@/utils/jpdb";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";
import { HorizontalFittingText } from "@/components/HozontalFittingText";
import { VerticalFittingText } from "@/components/VerticalFittingText";

const nonHiraganaRegex = /^[^一-龠ぁ-ゔァ-ヴー々〆〤ヶ]+$/u

function determinePOSColor(pos: string): string{
  // if (pos === "Particle") return "#BF4F4F" // darker light red
  // if (pos === "Proper noun") return "#4F70BF" // darker light blue
  // if (pos === "Noun") return "#4F8FBF" // darker light aqua
  // if (pos.startsWith("Verb")) return "#3FBF3F" // darker light green
  // if (pos.startsWith("Adjective")) return "#9F4FBF" // darker light purple
  // if (pos === "Adverb") return "#8FBF4F" // darker light lime
  // if (pos === "Pronoun") return "#EF9F4F" // darker light yellow
  return "#232323" // darker light gray
}

export default function ViewerScreen(){
  const {photoPath} = useLocalSearchParams();
  const [blocks, setBlocks] = React.useState<TextBlock[]>([])
  const [imageDimensions, setImageDimensions] = React.useState({width: 0, height: 0})
  const [overlay, setOverlay] = React.useState(<></>)
  const [details, setDetails] = React.useState(<></>)
  const [isDetailsVisible, setIsDetailsVisible] = React.useState(false)

  useEffect(() => {
    setIsDetailsVisible(React.Children.count(details.props.children) > 0)
  }, [details])

  const router = useRouter();

  const handleReturnButton = () => {
    router.push({pathname: "/"})
  }

  const handleTextPress = async (text: string, displayLoading = true) => {
    text = text.replaceAll(/[^一-龠ぁ-ゔァ-ヴー々〆〤ヶ。、！？!]/g, '')
    //TODO Set details to loading
    if (displayLoading) {
      setDetails(
        <View><Text style={{fontSize: 20}}>Loading...</Text></View>
      )
    }
    const [words, translation] = await analyse(text)
    console.log(text)
    console.log(translation)
    console.log('Output', JSON.stringify(words))
    const elements = []
    for (let [i, word] of words.entries()) {
      const wordElements = []
      const color = determinePOSColor(word.partsOfSpeaches[0])
      for (let [j, fragment] of word.fragments.entries()) {
        wordElements.push(
          <View key={j} style= {{alignItems: "center"}}>
            <Text style={{fontSize: 15, color: color}}>{fragment.furigana}</Text>
            <Text style={{fontSize: 30, color: color}}>{fragment.original}</Text>
          </View>
        )
      }
      elements.push(<View key={i} style={{flexDirection: "row"}}>{wordElements}</View>)
    }
    setDetails(
      <View style={{flexDirection:"column", justifyContent: "center" }}>
        <View style={{flexDirection: "row"}}>
          {elements}
        </View>
        {/* <View style={{flex: 1, alignContent: "flex-start"}}>
          <Text style={{fontSize: 20}}>{translation}</Text>
        </View> */}
      </View>
    )
    if (translation === "Translating..."){
      setTimeout(() => {
        handleTextPress(text, displayLoading = false)
      }, 1000)
    }
  }

  // recognize text and set blocks
  useEffect(
    () => {
      Image.getSize(`file://${photoPath}`, (width, height) => {
        setImageDimensions({width, height})
      })

      TextRecognition.recognize(`file://${photoPath}`, 
        TextRecognitionScript.JAPANESE
      ).then(async (result) => {
        setBlocks(result.blocks)
      })
    }, []
  )

  // update overlay when blocks change
  useEffect(() => {
    (async() => {
      let components = []
      for (let [blockIndex, block] of blocks.entries()) {
        for (let [lineIndex, line] of block.lines.entries()) {
          if (line.frame === undefined) continue
          if (line.frame.height <= imageDimensions.height * 0.01) continue
          if (nonHiraganaRegex.test(line.text)) continue

          const cleanText = line.text.replaceAll(/[|]/g, '')
          components.push(
            <TouchableOpacity 
              style={{
                position: 'absolute',
                top: (line.frame.top / imageDimensions.height * 100 + '%') as DimensionValue,
                left: (line.frame.left / imageDimensions.width * 100 + '%') as DimensionValue,
                width: (line.frame.width / imageDimensions.width * 100 + '%') as DimensionValue,
                height: (line.frame.height / imageDimensions.height * 100 + '%') as DimensionValue,
                backgroundColor: 'grey',
                opacity: 0.85,
                padding: 0,
                borderRadius: 6,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }} 
              key={`${blockIndex}-${lineIndex}`}
              activeOpacity={1}
              onPress={() => {handleTextPress(cleanText)}}
            >
              {
                line.frame.width > line.frame.height ?
                  <HorizontalFittingText 
                  text={cleanText} 
                  textStyle={{
                    color: 'white'
                  }}
                  ></HorizontalFittingText> :
                  <VerticalFittingText
                  text={cleanText} 
                  textStyle={{
                    color: 'white'
                  }}
                  ></VerticalFittingText>
              }
            </TouchableOpacity>
          )
        }
      }
      setOverlay(
        <>
          {components}
        </>
      )
    })()
  }, [blocks, imageDimensions])

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Home Page", headerShown: false }} />
      <View 
        style={styles.imageContainer}
      >
        <ReactNativeZoomableView
          maxZoom={6}
          minZoom={0.5}
          visualTouchFeedbackEnabled={false}
          bindToBorders={true}
        >
          <View style={[styles.imageWrapper, {width: imageDimensions.width * 0.2, height: imageDimensions.height * 0.2}]}>
            <Image
              source={{ uri: `file://${photoPath}` }}
              style={styles.image}
              />
            {overlay}
          </View>
        </ReactNativeZoomableView>
      </View>
      <View style={{flex: 1.2, backgroundColor: "white", borderRadius: 30, overflow: "hidden", marginVertical: "3%", display: isDetailsVisible ? "flex" : "none",}}>
        <ScrollView horizontal>
          <View style={{ padding: 20, flexDirection: 'column', justifyContent: 'center'}}>
            {details}
          </View>
        </ScrollView>
      </View>
      <View style={styles.returnButtonContainer}>
        <TouchableHighlight style={styles.returnButton} onPress={handleReturnButton}>
          <Ionicons name="arrow-back-outline" size={60} color="white"/>
        </TouchableHighlight>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 40,
    backgroundColor: "black",
  },
  imageContainer: {
    borderRadius: 30, 
    overflow: "hidden", 
    flex: 6
  },
  imageWrapper: {
    borderRadius: 30,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "stretch"
  },
  detailsContainer: {
    
  },
  returnButtonContainer: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center"
  },
  returnButton: {
    padding: 20,
    backgroundColor: "grey",
    height: 100,
    borderRadius: 50
  }
});