import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { CanvasSpace, ISoundAnalyzer, Sound, SoundType } from 'pts';
import { useTheme } from '@material-ui/core/styles';

interface Props {
  selectedMediaDeviceId: string;
}

export default function VolumeMeter({
  selectedMediaDeviceId,
}: Props): ReactElement {
  const canvasRef = useRef(null);
  const theme = useTheme();

  const CANVAS_WIDTH = theme.dimensions.Tray.width;
  const CANVAS_HEIGHT =
    theme.dimensions.Tray.height - theme.dimensions.Navigation.height;

  useEffect(() => {
    const getSound = async () => {
      const sound = (
        await Sound.input({ audio: { deviceId: selectedMediaDeviceId } })
      ).analyze(); // default frequency bin size = 256

      const space = new CanvasSpace(`#${canvasRef.current.id}`);
      const rainbow = ['#f03', '#f90', '#fe6', '#3c0', '#0f6', '#03f', '#60f'];
      const form = space.getForm();
      console.log('visualize, space:', space);

      space.add({
        animate: (time, ftime) => {
          if (sound && sound.playable) {
            let mapped_fd = sound.freqDomainTo(space.size);
            // let fd = sound.freqDomain();
            // console.log('fd:', fd);

            // const dbArray = fd.map((val) => 20 * Math.log10(val));

            let band = space.size.y / 200;
            // rainbow.forEach((r, i) => {
            //   form.strokeOnly(r, band * rainbow.length - i * band).line(td);
            // });

            form.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            form.strokeOnly('#333', band).line(mapped_fd);
          }
        },
      });
      space.play();
    };
    getSound();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        width: '100%',
        bottom: 32,
      }}
    >
      <canvas
        ref={canvasRef}
        id="audio-visualizer"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          transform: 'rotateX(180deg)',
        }}
      />
    </div>
  );
}
