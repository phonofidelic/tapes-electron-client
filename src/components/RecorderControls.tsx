import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';

interface RecorderControlsProps {
  isMonitoring: boolean;
  isRecording: boolean;
  handleStartRecording(): void;
  handleStopRecording(): void;
  handleStartMonitor(): void;
  handleStopMonitor(): void;
}

interface ButtonContainerProps {
  width: number;
}

const Container = styled.div`
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100%;
`;

interface ButtonContainerProps {
  width: number;
}

const ButtonContainer =
  styled.div <
  ButtonContainerProps >
  `
  width: ${(props) => props.width}%;
`;

export const ControllButton = styled(Button)`
  width: 100%;
  height: 50px;
`;

export default function RecorderControls({
  isMonitoring,
  isRecording,
  handleStartRecording,
  handleStopRecording,
  handleStartMonitor,
  handleStopMonitor,
}: RecorderControlsProps) {
  return (
    <Container>
      <ButtonContainer width={20}>
        <Tooltip
          enterDelay={500}
          title={
            !isMonitoring ? 'Click to start monitor' : 'Click to stop monitor'
          }
        >
          <Button
            onClick={() =>
              !isMonitoring ? handleStartMonitor() : handleStopMonitor()
            }
          >
            {!isMonitoring ? <MicOffIcon /> : <MicIcon />}
          </Button>
        </Tooltip>
      </ButtonContainer>
      <ButtonContainer width={80}>
        {!isRecording ? (
          <Button
            data-testid="button_start-rec"
            style={{
              color: '#e63c36',
            }}
            fullWidth
            onClick={() => handleStartRecording()}
          >
            rec
          </Button>
        ) : (
          <Button
            data-testid="button_stop-rec"
            fullWidth
            onClick={() => handleStopRecording()}
          >
            stop
          </Button>
        )}
      </ButtonContainer>
    </Container>
  );
}
