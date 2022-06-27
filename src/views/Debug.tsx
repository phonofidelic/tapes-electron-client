import React, { ReactElement, useEffect, useState } from 'react'
import styled from 'styled-components';
import { Button, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircleIcon from '@mui/icons-material/Circle';

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

  const handleClearCompanions = async () => {
    const confirmed = window.confirm('Are you sure you want to remove all companions?')
    if (!confirmed) return;

    try {
      await window.db.removeAllCompanions()
      console.log('Companions removed')
    } catch (err) {
      console.error('Could not remove companions')
    }
  }

  useEffect(() => {
    if (!window.db || !window.db.initialized) return console.log('No DB or not initialized in Debug')
    console.log('DB initialized in Debug')

    setPeerInfo(window.db.peerInfo)
    setCompanions(window.db.getAllCompanions())
    setUserData(window.db.getUserData())
  }, [window.db])

  const renderTree = (data: any, _key?: string): any => {
    switch (typeof data) {
      case 'undefined':
        return null;

      case 'string':
        return <TreeItem key={data} nodeId={data} label={data} />;

      case 'object':
        return Array.isArray(data)
          ? data.map((node: any) => <TreeItem key={node} nodeId={String(node)} label={String(node)} />)
          : Object.keys(data).map((objKey) => (
            /orbitdb/.test(objKey)
              ? <TreeItem
                key={objKey}
                nodeId={'obj_' + objKey}
                label={objKey}
                icon={<CircleIcon color={data[objKey].status === 'online' ? 'success' : 'action'} />}
              >{data[objKey] ? renderTree(data[objKey], objKey) : null}</TreeItem>
              : <TreeItem key={objKey} nodeId={'obj_' + objKey} label={objKey}>{data[objKey] ? renderTree(data[objKey], objKey) : null}</TreeItem>
          ))

      default:
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
      <Section>
        <div><Button onClick={handleClearCompanions}>Clear companions</Button></div>
      </Section>
    </div>
  )
}