export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  typography: {
    h1: {
      fontSize: number;
      lineHeight: number;
      fontWeight: "bold" | "600" | "normal";
    };
    h2: {
      fontSize: number;
      lineHeight: number;
      fontWeight: "bold" | "600" | "normal";
    };
    body: {
      fontSize: number;
      lineHeight: number;
    };
    caption: {
      fontSize: number;
      lineHeight: number;
    };
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#0a7ea4',
    secondary: '#687076',
    background: '#ffffff',
    card: '#B5BFC4',
    text: '#11181C',
    textSecondary: '#687076',
    border: '#E5E7EB',
    error: '#DC2626',
    success: '#059669',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: "bold",
    },
    h2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: "600",
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      lineHeight: 20,
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#fff',
    secondary: '#9BA1A6',
    background: '#151718',
    card: '#4B5357',
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    border: '#2D3235',
    error: '#F87171',
    success: '#34D399',
  },
}; 