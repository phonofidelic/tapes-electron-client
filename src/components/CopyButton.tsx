import React, { useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type CopyButtonProps = {
  data: string
}

export default function CopyButton({ data }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
    
    const handleCopy = async () => {
      await navigator.clipboard.writeText(data)

      setCopied(true)
      setTimeout(() => setCopied(false), 800)
    }

    return (
      <Tooltip title="Content copied!" open={copied}>
        <IconButton size="small" onClick={handleCopy}>
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
    )
}