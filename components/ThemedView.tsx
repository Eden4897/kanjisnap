import { View, ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ThemedViewProps = ViewProps & {
  variant?: 'background' | 'card';
};

export function ThemedView({ 
  style, 
  variant = 'background',
  ...otherProps 
}: ThemedViewProps) {
  const { theme } = useTheme();
  
  const backgroundColor = variant === 'card' 
    ? theme.colors.card 
    : theme.colors.background;

  return (
    <View 
      style={[
        { backgroundColor },
        style
      ]} 
      {...otherProps} 
    />
  );
}
