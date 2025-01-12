import React from 'react';
import { LayoutRectangle, Text, TextStyle, View, ViewStyle, StyleSheet} from 'react-native';

interface FittingTextProps {
  text: string,
  textStyle?: TextStyle,
  viewStyle?: ViewStyle,
}

export function VerticalFittingText({ text, textStyle = {}, viewStyle = {} }: FittingTextProps) {
  const [fontSize, setFontSize] = React.useState(20);
  const [lineHeight, setLineHeight] = React.useState(30);
  const [containerDimensions, setContainerDimensions] = React.useState<LayoutRectangle>({x: 0, y: 0, width: 0, height: 0});
  const [textDimensions, setTextDimensions] = React.useState<LayoutRectangle>({x: 0, y: 0, width: 0, height: 0});
  const [hasMeasured, setHasMeasured] = React.useState(false);

  React.useEffect(() => {
    if (hasMeasured) return;
    if (containerDimensions.width === 0 || textDimensions.width === 0) return;
    const newLineHeight = lineHeight * (containerDimensions.height / textDimensions.height);
    setLineHeight(newLineHeight);
    const newFontSize = fontSize * (containerDimensions.width / textDimensions.width);
    setFontSize(newLineHeight/1.5);
    setHasMeasured(true);
  }, [containerDimensions, text, textDimensions, hasMeasured]);

  return (
    <View style={[viewStyle, {flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}]} onLayout={e => {
      setContainerDimensions(e.nativeEvent.layout);
      setHasMeasured(false)
    }}>
      <Text 
        onLayout={e => {
          setTextDimensions(e.nativeEvent.layout);
        }}
      >
        <View style={styles.container}>
          {text.split('').map((char, index) => (
            <Text key={index} style={[textStyle, {fontSize, lineHeight}]}>
              {char}
            </Text>
          ))}
        </View>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
  },
});