import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    dimensions: {
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
