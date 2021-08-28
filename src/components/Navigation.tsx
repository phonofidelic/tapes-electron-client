import React, { ReactElement, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import SettingsIcon from '@material-ui/icons/Settings';
import MicIcon from '@material-ui/icons/Mic';
import StorageIcon from '@material-ui/icons/Storage';

interface Props {}

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.palette.text.primary};
  text-decoration: none;
  flex: 1;
  text-align: center;
`;

export default function Navigation({}: Props): ReactElement {
  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();

  return (
    <BottomNavigation
      style={{
        backgroundColor: '#e9eae6',
        height: theme.dimensions.Navigation.height,
        position: 'fixed',
        width: '100%',
        top: '0px',
        zIndex: theme.zIndex.appBar,
      }}
      value={activeTab}
      onChange={(event, newValue) => setActiveTab(newValue)}
    >
      <BottomNavigationAction
        data-testid="nav-link_recorder"
        label="Recorder"
        icon={<MicIcon />}
        component={Link}
        to="/recorder"
      />
      <BottomNavigationAction
        data-testid="nav-link_library"
        label="Library"
        icon={<StorageIcon />}
        component={Link}
        to="/library"
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
