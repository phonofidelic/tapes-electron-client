import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

declare module '@material-ui/core/styles/createMuiTheme' {
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
    };
  }

  interface ThemeOptions {
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
    };
  }
}

const theme = createMuiTheme({
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
  },
});

export { theme };
