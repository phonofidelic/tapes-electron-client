import React from 'react'
import Modal from '@material-ui/core/Modal';
import QRCode from "react-qr-code";
import { useTheme } from '@mui/material/styles'
import { Button } from '@mui/material';

type Props = {
  open: boolean;
  value: string;
  onClose(): void;
}

export default function QRCodeModal({ open, value, onClose }: Props) {
  const theme = useTheme()

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{
        height: theme.dimensions.Tray.height,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center'
        }}>
          <QRCode value={value} />
        </div>
        <div>{value}</div>
        {/* <div>
          <Button style={{ backgroundColor: '#fff' }}>Close</Button>
        </div> */}
      </div>
    </Modal>
  )
}