import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, IconButton, Tooltip, Typography } from '@mui/material';
import { TreeView, TreeItem } from '@mui/lab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CircleIcon from '@mui/icons-material/Circle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyButton from '../components/CopyButton';
import useCompanions from '@/hooks/useCompanions';
import useUser from '@/hooks/useUser';
import { useOrbitConnection } from '@/contexts/OrbitdbConnectionContext';

declare const LIBP2P_SIG_SERVER: string;

const Section = styled.div`
  margin: 0px;
`;

export function Debug() {
  const [companions] = useCompanions();
  const [accountInfo] = useUser();
  const connection = useOrbitConnection();
  const peerInfo = connection.peerInfo;

  const handleClearCompanions = async () => {
    console.log('TODO: Re-implement clear all companions');
  };

  const renderCopyButton = (data: string) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      await navigator.clipboard.writeText(data);

      setCopied(true);
      setTimeout(() => setCopied(false), 500);
    };

    return (
      <Tooltip title="Content copied!" open={copied}>
        <IconButton onClick={handleCopy}>
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const renderTree = (data: any, _key?: string): any => {
    switch (typeof data) {
      case 'undefined':
        return null;

      case 'string':
        return (
          <TreeItem
            key={data}
            nodeId={data}
            label={<Typography noWrap>{data}</Typography>}
          />
        );

      case 'object':
        return Array.isArray(data)
          ? data.map((node: any) => (
              <TreeItem key={node} nodeId={String(node)} label={String(node)} />
            ))
          : Object.keys(data).map((objKey, i) =>
              /orbitdb/.test(objKey) ? (
                <TreeItem
                  key={objKey}
                  nodeId={`obj_${objKey}_${i}`}
                  label={
                    <Typography noWrap>
                      {objKey}{' '}
                      <CopyButton
                        data={JSON.stringify(data[objKey], null, 2)}
                      />
                    </Typography>
                  }
                  icon={
                    <CircleIcon
                      color={
                        data[objKey].status === 'online' ? 'success' : 'action'
                      }
                    />
                  }
                >
                  {data[objKey] ? renderTree(data[objKey], objKey) : null}
                </TreeItem>
              ) : (
                <TreeItem
                  key={objKey}
                  nodeId={`obj_${objKey}_${i}`}
                  label={
                    <Typography noWrap>
                      {objKey}{' '}
                      <CopyButton
                        data={JSON.stringify(data[objKey], null, 2)}
                      />
                    </Typography>
                  }
                >
                  {data[objKey] ? renderTree(data[objKey], objKey) : null}
                </TreeItem>
              )
            );

      default:
        return null;
    }
  };

  return (
    <div style={{ margin: 0 }}>
      <h1>Debug</h1>
      <Section>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem
            nodeId="sigServer"
            label={
              <>
                signaling server{' '}
                <CopyButton data={JSON.stringify(LIBP2P_SIG_SERVER, null, 2)} />
              </>
            }
          >
            {renderTree(LIBP2P_SIG_SERVER)}
          </TreeItem>
        </TreeView>
      </Section>
      <Section>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem
            nodeId="peerInfo"
            label={
              <>
                peerInfo <CopyButton data={JSON.stringify(peerInfo, null, 2)} />
              </>
            }
          >
            {peerInfo && renderTree(peerInfo)}
          </TreeItem>
        </TreeView>
      </Section>
      <Section>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem
            nodeId="accountInfo"
            label={
              <>
                accountInfo{' '}
                <CopyButton data={JSON.stringify(accountInfo, null, 2)} />
              </>
            }
          >
            {accountInfo && renderTree(accountInfo)}
          </TreeItem>
        </TreeView>
      </Section>
      <Section>
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          <TreeItem
            nodeId="companions"
            label={
              <>
                companions{' '}
                <CopyButton data={JSON.stringify(companions, null, 2)} />
              </>
            }
          >
            {companions && renderTree(companions)}
          </TreeItem>
        </TreeView>
      </Section>
      <Section>
        <div>
          <Button onClick={handleClearCompanions}>Clear companions</Button>
        </div>
      </Section>
    </div>
  );
}

export default Debug;
