// @ts-nocheck
/***
 *	Adapted from: https://www.twilio.com/blog/audio-visualisation-web-audio-api--react
 */
import React, { Component } from 'react';
import AudioVisualiser from './AudioVisualiser';

interface AudioAnalyserProps {
  isMonitoring: boolean;
}

class AudioAnalyser extends Component<AudioAnalyserProps> {
  constructor(props: AudioAnalyserProps) {
    super(props);
    this.state = { audioData: new Uint8Array(0) };
  }

  async componentDidMount() {
    // const { audioStream } = this.props;
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.source = this.audioCtx.createMediaStreamSource(audioStream);
    this.source.connect(this.analyser);
    this.props.isMonitoring && this.analyser.connect(this.audioCtx.destination);
    this.rafId = requestAnimationFrame(this.tick);
  }

  componentDidUpdate() {
    this.props.isMonitoring
      ? this.analyser.connect(this.audioCtx.destination)
      : this.analyser.disconnect();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rafId);
    this.audioCtx.destination.disconnect();
    this.analyser.disconnect();
    this.source.disconnect();
  }

  tick = () => {
    this.analyser.getByteTimeDomainData(this.dataArray);
    this.setState({ audioData: this.dataArray });
    this.rafId = requestAnimationFrame(this.tick);
  };

  render() {
    return <AudioVisualiser audioData={this.state.audioData} />;
  }
}

export default AudioAnalyser;
