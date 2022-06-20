import React, { ReactElement, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface Props {
  accept: string;
  children?: ReactElement | ReactElement[];
  onFileDrop(files: File[]): void;
}

export default function FileDrop({
  accept,
  onFileDrop,
  children,
}: Props): ReactElement {
  const theme = useTheme();

  const onDrop = useCallback(async (acceptedFiles) => {
    // console.log('Droped files:', acceptedFiles);
    if (acceptedFiles.length) onFileDrop(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
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
            backgroundColor: alpha(theme.palette.background.default, 0.9),
            color: theme.palette.text.secondary,
          }}
        >
          <div style={{ margin: '0 auto' }}>Drop files here...</div>
        </div>
      )}
      <input {...getInputProps()} type="file" name="identity" />
      {children}
    </div>
  );
}
