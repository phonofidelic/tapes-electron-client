import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

declare const LIBP2P_SIG_SERVER: string

type Props = {}

const Section = styled.div`
  margin: 8px
`

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
    <div style={{ margin: 8 }}>
      <h1>Debug</h1>
      <Section>
        <div>Peer ID:</div>
        <div><Typography variant="caption">{peerInfo?.id}</Typography></div>
      </Section>
      <Section>
        <div>
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
          >
            <TreeItem nodeId="peerInfo" label="PeerInfo:">
              {peerInfo && Object.keys(peerInfo).map((key, i) => (
                <TreeItem nodeId={key} label={key}>
                  {typeof peerInfo[key] === 'string' ? (
                    peerInfo[key]
                  ) : (
                    peerInfo[key]
                      .filter((field: string) => key !== 'addresses')
                      .map((value: string) => (
                        <TreeItem nodeId={value} label={value} />
                      )))
                  }
                </TreeItem>
              ))}
            </TreeItem>
          </TreeView>
        </div>
      </Section>
      <Section>
        <div>Signaling server:</div>
        <div><Typography noWrap variant="caption">{LIBP2P_SIG_SERVER}</Typography></div>
      </Section>
      <Section>
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
      </Section>
    </div>
  )
}