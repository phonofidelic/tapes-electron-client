import React, { ChangeEvent, useState, useRef, useEffect } from 'react';
import { TextField, Fade } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

import useHover from '../hooks/useHover';

type EditableTextProps = {
  textValue: string;
  children: React.ReactNode;
  size?: 'small' | 'medium';
  onChangeCommitted(newTextValue: string): void;
};

export default function EditableText({
  textValue,
  size = 'medium',
  onChangeCommitted,
  children,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [newTextValue, setNewTextValue] = useState(textValue);
  const [hoverRef, hovered] = useHover();
  const inputElement = useRef(null);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditing(true);
  };

  const commitChanges = (value: string) => {
    setEditing(false);
    onChangeCommitted(value);
  };

  const handleChange = (
    event: ChangeEvent<{ name?: string; value: string }>
  ) => {
    setNewTextValue(event.target.value);
  };

  const handleBlur = () => {
    setEditing(false);
    onChangeCommitted(newTextValue);
  };

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        commitChanges(newTextValue);
      }
    };
    if (editing && inputElement.current) {
      inputElement.current.addEventListener('keydown', handleKeydown);
    }

    return () => {
      removeEventListener('keydown', handleKeydown);
    };
  }, [editing, newTextValue]);

  if (editing)
    return (
      <span style={{ display: 'flex', width: '100%' }}>
        <TextField
          ref={inputElement}
          placeholder={textValue}
          value={newTextValue}
          size={size}
          autoFocus
          fullWidth
          onBlur={handleBlur}
          onChange={handleChange}
          variant="standard"
          onDoubleClick={(event: React.MouseEvent) => event.stopPropagation()}
        />
      </span>
    );

  return (
    <span
      style={{
        display: 'flex',
        cursor: 'pointer',
        textDecoration: hovered ? 'underline' : 'none',
      }}
      ref={hoverRef}
      onClick={handleClick}
      onDoubleClick={handleClick}
    >
      {children}
      <div style={{ marginLeft: 4 }}>
        <Fade in={hovered}>
          <EditIcon fontSize="small" color="disabled" />
        </Fade>
      </div>
    </span>
  );
}
