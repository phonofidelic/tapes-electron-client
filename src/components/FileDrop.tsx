import { LocalConvenienceStoreOutlined } from '@material-ui/icons';
import React, { ReactElement, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';

interface Props {
  children?: ReactElement[];
}

export default function FileDrop({ children }: Props): ReactElement {
  const theme = useTheme();

  const onDrop = useCallback(async (acceptedFiles) => {
    console.log('Droped files:', acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
  });

  return (
    <div
      {...getRootProps({
        onClick: (e) => e.stopPropagation(),
      })}
    >
      {isDragActive && (
        <div
          style={{
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            border: `4px dashed ${theme.palette.text.secondary}`,
            borderRadius: 4,
            zIndex: 10000,
            backgroundColor: fade(theme.palette.background.default, 0.9),
            color: theme.palette.text.secondary,
          }}
        >
          <div style={{ margin: '0 auto' }}>Drop files here...</div>
        </div>
      )}
      <input {...getInputProps()} type="file" name="identity" />
      {...children}
    </div>
  );
}
