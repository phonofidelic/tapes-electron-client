import React, { ReactElement, useState } from 'react';
import { connect } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { RecorderState } from '../store/types';

import { useTheme } from '@mui/material/styles';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import SettingsIcon from '@mui/icons-material/Settings';
import MicIcon from '@mui/icons-material/Mic';
import StorageIcon from '@mui/icons-material/Storage';
import DebugIcon from '@mui/icons-material/Info';


interface Props {
  debugEnabled: boolean;
}

const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.palette.text.primary};
  text-decoration: none;
  flex: 1;
  text-align: center;
`;

export function Navigation({ debugEnabled }: Props): ReactElement {
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
        left: '0px',
        justifyContent: 'center',
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
      {debugEnabled &&
        <BottomNavigationAction
          data-testid="nav-link_debug"
          label="Debug"
          icon={<DebugIcon />}
          component={Link}
          to="/debug"
        />
      }
    </BottomNavigation>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    debugEnabled: state.debugEnabled
  }
}

export default connect(mapStateToProps, null)(Navigation)