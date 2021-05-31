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

  // return (
  //   <div
  //     style={{
  //       display: 'flex',
  //       justifyContent: 'space-between',
  //       backgroundColor: '#e9eae6',
  //       height: theme.dimensions.Navigation.height,
  //       position: 'fixed',
  //       width: '100%',
  //       top: '0px',
  //       zIndex: theme.zIndex.appBar,
  //       color: theme.palette.text.primary,
  //     }}
  //   >
  //     <StyledNavLink
  //       theme={theme}
  //       activeStyle={{
  //         borderBottom: `2px solid ${theme.palette.text.primary}`,
  //       }}
  //       to="/recorder"
  //     >
  //       <div>
  //         <MicIcon />
  //       </div>
  //       <div>Recorder</div>
  //     </StyledNavLink>
  //     <StyledNavLink
  //       theme={theme}
  //       activeStyle={{
  //         borderBottom: `2px solid ${theme.palette.text.primary}`,
  //       }}
  //       to="/storage"
  //     >
  //       <div>
  //         <StorageIcon />
  //       </div>
  //       <div>Library</div>
  //     </StyledNavLink>
  //     <StyledNavLink
  //       theme={theme}
  //       activeStyle={{
  //         borderBottom: `2px solid ${theme.palette.text.primary}`,
  //       }}
  //       to="/settings"
  //     >
  //       <div>
  //         <SettingsIcon />
  //       </div>
  //       <div>Settings</div>
  //     </StyledNavLink>
  //   </div>
  // );

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
