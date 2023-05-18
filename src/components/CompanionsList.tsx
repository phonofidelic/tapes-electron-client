import React, { useState, useEffect } from 'react';
import { Companion } from '../common/Companion.interface';
import {
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CircleIcon from '@mui/icons-material/Circle';

type CompanionsListProps = {
  companions: Companion[];
};

export default function CompanionsList({ companions }: CompanionsListProps) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <Typography style={{ lineHeight: '40px' }} color="textSecondary">
          Connected devices:
        </Typography>
        <IconButton onClick={() => setOpen(!open)}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>
      <Collapse in={open}>
        {companions?.length > 0 ? (
          <List dense>
            {companions.map((companion) => (
              <ListItem key={companion.nodeId} dense>
                <Tooltip title={`Status: ${companion.status}`}>
                  <ListItemIcon>
                    <CircleIcon
                      fontSize="small"
                      color={
                        companion.status === 'online' ? 'success' : 'action'
                      }
                    />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText>{companion.deviceName}</ListItemText>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="caption" color="textSecondary">
            Your connected devices will be listed here
          </Typography>
        )}
      </Collapse>
    </div>
  );
}
