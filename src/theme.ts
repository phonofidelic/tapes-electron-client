import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    dimensions: {
      Navigation: {
        width: number;
        height: number;
      };
    };
  }

  interface ThemeOptions {
    dimensions?: {
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
    Navigation: {
      height: 56,
    },
  },
});

export { theme };
