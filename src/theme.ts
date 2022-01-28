import {
  createTheme,
  DeprecatedThemeOptions,
  adaptV4Theme,
  Theme,
} from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    dimensions: {
      AudioPlayer: {
        width: number;
        height: number;
      };
      Tray: {
        width: number;
        height: number;
      };
      Navigation: {
        width: number;
        height: number;
      };
      Player: {
        idth: number;
        height: number;
      };
    };
  }

  interface DeprecatedThemeOptions {
    dimensions?: {
      AudioPlayer?: {
        width?: number;
        height?: number;
      };
      Tray?: {
        width?: number;
        height?: number;
      };
      Navigation?: {
        width?: number;
        height?: number;
      };
      Player?: {
        width?: number;
        height?: number;
      };
    };
  }
}

const theme = createTheme(
  adaptV4Theme({
    palette: {
      primary: {
        main: '#323332',
      },
      background: {
        default: '#e9eae6',
      },
    },
    dimensions: {
      AudioPlayer: {
        height: 48,
      },
      Tray: {
        width: 350,
        height: 400,
      },
      Navigation: {
        height: 56,
      },
      Player: {
        height: 56,
      },
    },
  })
);

export { theme };
