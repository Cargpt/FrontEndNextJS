import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from '@mui/material';
import React, { useState } from 'react'
import AllowLocationHelp from './AllowLocationHelp';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type Props = {
   onClose: ()=>void;
   show:boolean;
   onAcknowledge: ()=>void; // New prop


}

const AskLocation = (props: Props) => {
    const [showLocationHelp, setShowLocationHelp] = useState<boolean>(false);
    
      const handleShowInfo = ()=>setShowLocationHelp(!showLocationHelp)
  return (
   <Dialog open={props.show} onClose={props.onClose}>
  <DialogTitle>Location Required</DialogTitle>
  <DialogContent>
    <DialogContentText>
      We need your location to show nearby car showrooms. Please allow location access in your browser settings and try again.
          {/* Info Icon */}
    <IconButton
      size="small"
      onClick={() => setShowLocationHelp(true)}
      sx={{ p: 0.5 }}
    >
      <InfoOutlinedIcon sx={{ fontSize: 18, color: "#888" }} />
    </IconButton>
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    {/* <Button onClick={props.onClose} color="secondary">
      Cancel
    </Button> */}
    <Button onClick={() => { props.onAcknowledge(); props.onClose(); }} color="primary" autoFocus>
      Ok
    </Button>
  </DialogActions>
        <AllowLocationHelp open={showLocationHelp} onClose={handleShowInfo} />

</Dialog>

  )
}

export default AskLocation;