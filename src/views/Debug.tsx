import React, { useEffect, useState } from 'react'
import { Tooltip, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles';

declare const LIBP2P_SIG_SERVER: string

type Props = {}

export default function Debug({ }: Props) {
  const [companions, setCompanions] = useState([])
  const [peerInfo, setPeerInfo] = useState(null)
  const theme = useTheme()

  useEffect(() => {
    if (!window.db || !window.db.initialized) return console.log('No DB or not initialized in Debug')
    console.log('DB initialized in Debug')

    setPeerInfo(window.db.peerInfo)
    setCompanions(window.db.listCompanions())
  }, [window.db])

  console.log('*** Debug, peerInfo:', peerInfo)

  return (
    <div>
      <h1>Debug</h1>
      <div>Peer ID:</div>
      <div><Typography variant="caption">{peerInfo?.id}</Typography></div>
      <div>Signaling server:</div>
      <div><Typography variant="caption">{LIBP2P_SIG_SERVER}</Typography></div>
      <div>Companions:</div>
      <ul>
        {Object.keys(companions).map((companion: string) => (
          <li key={companion}>
            <Typography
              style={{ maxWidth: theme.dimensions.Tray.width }}
              noWrap
              variant="caption">
              {companion}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  )
}