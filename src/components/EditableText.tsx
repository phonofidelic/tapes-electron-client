import React, { ChangeEvent, useState } from 'react'
import { TextField, Fade } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';

import useHover from '../hooks/useHover';

type EditableTextProps = {
  textValue: string;
  children: React.ReactChild;
  size?: 'small' | 'medium';
  onChangeCommitted(newTextValue: string): void;
}

export default function EditableText({
  textValue, 
  size = 'medium', 
  onChangeCommitted,
  children, 
}: EditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [newTextValue, setNewTextValue] = useState(textValue)
  const [hoverRef, hovered] = useHover();

  const handleChangeCommitted = () => {
    setEditing(false)
    onChangeCommitted(newTextValue)
  }

  const handleChange = (event: ChangeEvent<{ name?: string; value: string }>)=> {
    setNewTextValue(event.target.value)
  }

  if (editing) return (
    <div style={{ display: 'flex' }}>
      <div>
        <TextField 
          placeholder={textValue}
          value={newTextValue}
          size={size}
          autoFocus
          fullWidth
          onBlur={handleChangeCommitted}
          onChange={handleChange}
          variant="standard"
        />
      </div>
    </div>
  )

  return (
    <div
      style={{
        display: 'flex',
        cursor: 'pointer',
          textDecoration:
            hovered ? 'underline' : 'none',
      }} 
      ref={hoverRef}
      onClick={() => setEditing(true)}
    >
      {children}
      <div style={{ marginLeft: 4 }}>
        <Fade in={hovered}>
          <EditIcon fontSize="small" color="disabled" />
        </Fade>
      </div>
    </div>
  )
}