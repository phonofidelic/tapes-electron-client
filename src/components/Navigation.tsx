import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import SettingsIcon from '@material-ui/icons/Settings';
import MicIcon from '@material-ui/icons/Mic';
import StorageIcon from '@material-ui/icons/Storage';

interface Props {}

export default function Navigation({}: Props): ReactElement {
  const theme = useTheme();

  return (
    <BottomNavigation
      style={{
        backgroundColor: '#e9eae6',
        height: 56,
        position: 'sticky',
        top: '0px',
        zIndex: theme.zIndex.appBar,
      }}
    >
      <BottomNavigationAction
        data-testid="nav-link_recorder"
        label="Recorder"
        icon={<MicIcon />}
        component={Link}
        to="/"
      />
      <BottomNavigationAction
        data-testid="nav-link_storage"
        label="Storage"
        icon={<StorageIcon />}
        component={Link}
        to="/storage"
      />
      <BottomNavigationAction
        data-testid="nav-link_settings"
        label="Settings"
        icon={<SettingsIcon />}
        component={Link}
        to="/settings"
      />
    </BottomNavigation>
  );
}
