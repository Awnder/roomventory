'use client';

import { Tooltip } from "@mui/material";

export default function TooltipIcon({children, title, placement, offset}) {
  return (
    <Tooltip 
      title={title}
      placement={placement}
      arrow 
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -10],
              },
            },
          ],
        }
      }}
    >
      {children}
    </Tooltip>
  )
}