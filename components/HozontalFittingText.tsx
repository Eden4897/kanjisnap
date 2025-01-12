import React from 'react';
import { LayoutRectangle, Text, TextStyle, View, ViewStyle } from 'react-native';

interface FittingTextProps {
  text: string,
  textStyle?: TextStyle,
  viewStyle?: ViewStyle,
}

export function HorizontalFittingText({ text, textStyle = {}, viewStyle = {} }: FittingTextProps) {
  const [fontSize, setFontSize] = React.useState(20);
  const [containerDimensions, setContainerDimensions] = React.useState<LayoutRectangle>({x: 0, y: 0, width: 100, height: 100});
  const textRef = React.useRef<Text>(null);

  React.useEffect(() => {
    if (textRef.current) {
      textRef.current.measure((x, y, width, height) => {
        if(!width) return;
        const newFontSize = fontSize * (containerDimensions.width / (width));
        setFontSize(newFontSize * 0.9);
      });
    }
  }, [containerDimensions, text, textRef]);

  return (
    <View style={[viewStyle, {flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}]} onLayout={e => {
      setContainerDimensions(e.nativeEvent.layout);
    }}>
      <Text>
        <View>
          <Text ref={textRef} style={[textStyle, {fontSize, lineHeight: fontSize * 1.3, textAlign: 'justify'}]}>
            {text}
          </Text>
        </View>
      </Text>
    </View>
  );
}