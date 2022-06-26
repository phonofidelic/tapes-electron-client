import React, { ReactElement, useEffect, useState } from 'react'
import styled from 'styled-components';
import { Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

declare const LIBP2P_SIG_SERVER: string

type Props = {}

const Section = styled.div`
  margin: 0px
`

export default function Debug({ }: Props) {
  const [companions, setCompanions] = useState([])
  const [peerInfo, setPeerInfo] = useState(null)
  const [userData, setUserData] = useState(null)
  const theme = useTheme()

  useEffect(() => {
    if (!window.db || !window.db.initialized) return console.log('No DB or not initialized in Debug')
    console.log('DB initialized in Debug')

    setPeerInfo(window.db.peerInfo)
    setCompanions(window.db.listCompanions())
    setUserData(window.db.getUserData())
  }, [window.db])

  const renderTree = (data: any, key?: string): any => {
    switch (typeof data) {
      case 'undefined':
        console.log('is undefined:', data)
        return null;

      case 'string':
        console.log('is string:', data)
        return <TreeItem key={data} nodeId={data} label={data} />;

      case 'object':
        console.log('is object or array:', data)
        return Array.isArray(data)
          ? data.map((node: any) => <TreeItem key={node} nodeId={String(node)} label={String(node)} />)
          : Object.keys(data).map((objKey) => (
            <TreeItem key={objKey} nodeId={'obj_' + objKey} label={objKey}>{data[objKey] ? renderTree(data[objKey], objKey) : null}</TreeItem>
          ))

      default:
        console.log('is something else:', data)
        return null
    }
  }

  return (
    <div style={{ margin: 0 }}>
      <h1>Debug</h1>
      <Section>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="sigServer" label="signaling server">
            <Typography noWrap variant="caption">{LIBP2P_SIG_SERVER && renderTree(LIBP2P_SIG_SERVER)}</Typography>
          </TreeItem>
        </TreeView>
      </Section>
      <Section>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="peerInfo" label="peerInfo">
            {peerInfo && renderTree(peerInfo)}
          </TreeItem>
        </TreeView>
      </Section>
      <Section>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="userData" label="userData">
            {userData && renderTree(userData)}
          </TreeItem>
        </TreeView>
      </Section>
      <Section>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem nodeId="companions" label="companions">
            {companions && renderTree(companions)}
          </TreeItem>
        </TreeView>
      </Section>
    </div>
  )
}