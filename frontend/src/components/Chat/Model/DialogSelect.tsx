import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import Typography from '@mui/material/Typography'


interface DialogSelectProps {
    open: boolean;
    message: string;
    header: string;
    onClose?: () => void;
}
const  DialogSelect:React.FC<DialogSelectProps>=({open, message, header, onClose}) => {

//   const handleChange = (event: SelectChangeEvent<typeof age>) => {
//     setAge(Number(event.target.value) || '');
//   };

  

//   const handleClose = (event: React.SyntheticEvent<unknown>, reason?: string) => {
//     if (reason !== 'backdropClick') {
//       setOpen(false);
//     }
//   };

  return (
    <div>
      <Button onClick={onClose}>{header}</Button>
      <Dialog disableEscapeKeyDown open={open} onClose={onClose}>
        <DialogTitle>
{message && (
      // ❌ Danger SVG
      (<svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="red"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>)
)
    }

        </DialogTitle>
        <DialogContent>
                      <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <Typography variant="h6" color="initial">{message}</Typography>
 
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DialogSelect;