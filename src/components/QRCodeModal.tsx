import React from 'react'
import Modal from '@material-ui/core/Modal';
import QRCode from "react-qr-code";
import { useTheme } from '@mui/material/styles'
import { Button, Typography, Slide } from '@mui/material';

type Props = {
  open: boolean;
  value: string;
  onClose(): void;
}

export default function QRCodeModal({ open, value, onClose }: Props) {
  const theme = useTheme()

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
  }

  return (
    <Modal style={{ backgroundColor: '#fff' }} hideBackdrop={true} open={open} onClose={onClose}>
      <Slide in={open} direction="up">
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
            justifyContent: 'center',
            flex: 1,
            marginTop: 64
          }}>
            <QRCode value={value} />
          </div>
          <div style={{ margin: 8, marginTop: 32 }}>
            <Typography>
              Scan this QR code on your mobile device or click <b>COPY LINK</b> and pasete into a browser to access your recordings on another device.
            </Typography>
          </div>
          <div style={{
            margin: 8,
            position: 'fixed',
            width: '100%',
            bottom: 0
          }}>
            <Button
              style={{ backgroundColor: '#fff', marginRight: 8 }}
              variant="outlined"
              onClick={handleCopy}
            >Coppy Link</Button>
            <Button style={{ backgroundColor: '#fff' }} onClick={onClose}>Close</Button>
          </div>
        </div>
      </Slide>
    </Modal>

  )
}