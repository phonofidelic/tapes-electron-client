// @ts-nocheck
/***
 *	Adapted from: https://www.twilio.com/blog/audio-visualisation-web-audio-api--react
 */
import React, { Component, createRef } from 'react';

const CANVAS_WIDTH = 350;
const CANVAS_HEIGHT = 375;

class AudioVisualiser extends Component {
  constructor(props) {
    super(props);

    this.canvas = createRef();
  }

  componentDidUpdate() {
    this.draw();
  }

  draw() {
    const { audioData } = this.props;
    const canvas = this.canvas.current;
    const height = canvas.height;
    const width = canvas.width;
    const ctx = canvas.getContext('2d');
    let x = 0;
    const sliceWidth = (width * 1.0) / audioData.length;

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#333';
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.lineTo(0, height / 2);

    for (const item of audioData) {
      // Normalize point data to canvas dimensions
      const y = (item / 255.0) * height;
      ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(x, height / 2);
    ctx.stroke();
  }

  render() {
    return (
      <div
        style={{
          position: 'fixed',
          width: '100%',
          bottom: 32,
        }}
      >
        <canvas
          style={{
            transform: 'rotateX(180deg)',
            // backgroundColor: `rgba(100, 0, 0, ${features?.rms})`,
          }}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={this.canvas}
        />
      </div>
    );
  }
}

export default AudioVisualiser;
