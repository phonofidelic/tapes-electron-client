import React, { useState, useEffect, useRef, ReactElement } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

const Container = styled.div`
  /* background-color: #e63c36; */
  height: 19px;
  line-height: 19px;
  vertical-align: middle;
  position: absolute;
  width: 100%;
`;

interface TimerProps {}

export default function Timer({}: TimerProps): ReactElement {
  const [time, setTime] = useState(0);

  const theme = useTheme();

  const centiseconds = ('0' + (Math.floor(time / 10) % 100)).slice(-2);
  const seconds = ('0' + (Math.floor(time / 1000) % 60)).slice(-2);
  const minutes = ('0' + (Math.floor(time / 60000) % 60)).slice(-2);
  const hours = ('0' + Math.floor(time / 3600000)).slice(-2);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setTime(Date.now() - start);
    }, 10);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Container>
      <div
        style={{
          // color: theme.palette.background.default,
          color: '#e63c36',
          textAlign: 'right',
          paddingRight: 8,
        }}
      >
        <Typography variant="caption">
          <b>RECORDING</b>
        </Typography>
      </div>
      <div
        style={{
          color: theme.palette.primary.dark,
          textAlign: 'right',
          paddingRight: 8,
        }}
      >
        <Typography
          style={{
            // display: props.display,
            margin: 0,
          }}
          variant={'body2'}
          noWrap
        >
          {hours} : {minutes} : {seconds} : {centiseconds}
        </Typography>
      </div>
    </Container>
  );
}
