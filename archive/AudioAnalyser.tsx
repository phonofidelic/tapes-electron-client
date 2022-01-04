// @ts-nocheck
/***
 *	Adapted from: https://www.twilio.com/blog/audio-visualisation-web-audio-api--react
 */
import React, { Component } from 'react';
import AudioVisualiser from './AudioVisualiser';

interface AudioAnalyserProps {
  isMonitoring: boolean;
  selectedMediaDeviceId: string;
}

class AudioAnalyser extends Component<AudioAnalyserProps> {
  constructor(props: AudioAnalyserProps) {
    super(props);
    this.state = {
      audioData: new Uint8Array(0),
      currentSelectedMediaDeviceId: props.selectedMediaDeviceId,
    };
  }

  async connectAudio() {
    // const { audioStream } = this.props;
    let audioStream;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: this.props.selectedMediaDeviceId },
        video: false,
      });
    } catch (err) {
      console.error('*** Could not get media stream:', err);
      throw new Error('Could not get media stream');
    }

    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (err) {
      console.error('*** Could not create audio context:', err);
      throw new Error('Could not create audio context');
    }

    try {
      this.analyser = this.audioCtx.createAnalyser();
    } catch (err) {
      console.error('*** Could not create audio analyser:', err);
    }
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.source = this.audioCtx.createMediaStreamSource(audioStream);
    this.source.connect(this.analyser);
    this.props.isMonitoring && this.analyser.connect(this.audioCtx.destination);
    this.rafId = requestAnimationFrame(this.tick);
  }

  disconnectAudio() {
    cancelAnimationFrame(this.rafId);
    this.audioCtx.destination.disconnect();
    this.analyser.disconnect();
    this.source.disconnect();
  }

  async componentDidMount() {
    await this.connectAudio();
  }

  componentDidUpdate() {
    // console.log(
    //   'AudioAnalyser, selectedMediaDeviceId:',
    //   this.props.selectedMediaDeviceId
    // );
    // this.connectAudio();
    if (
      this.props.selectedMediaDeviceId !==
      this.state.currentSelectedMediaDeviceId
    ) {
      console.log('Selected device changed:', this.props.selectedMediaDeviceId);
      this.disconnectAudio();
      this.connectAudio();
      this.setState({
        currentSelectedMediaDeviceId: this.props.selectedMediaDeviceId,
      });
    }

    this.props.isMonitoring
      ? this.analyser.connect(this.audioCtx.destination)
      : this.analyser.disconnect();
  }

  componentWillUnmount() {
    this.disconnectAudio();
  }

  tick = () => {
    // this.analyser.getByteTimeDomainData(this.dataArray);
    this.analyser.getByteFrequencyData(this.dataArray);
    this.setState({ audioData: this.dataArray });
    this.rafId = requestAnimationFrame(this.tick);
  };

  render() {
    return <AudioVisualiser audioData={this.state.audioData} />;
  }
}

export default AudioAnalyser;
