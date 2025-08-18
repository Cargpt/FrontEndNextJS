import React, { useState } from 'react';
import { Paper, Typography, Button, Stack } from '@mui/material';
import { useColorMode } from '@/Context/ColorModeContext';

interface OptionsCardProps {
  onBack: () => void;
  onShowCars: () => boolean;
  disabled?: boolean;
}

const OptionsCard: React.FC<OptionsCardProps> = ({ onBack, onShowCars, disabled = false }) => {
  const [clicked, setClicked] = useState<'' | 'show' | 'back'>('');

  const handleClick = (type: 'show' | 'back') => {
    if (type === 'show'){
     const showcars= onShowCars()
     if(showcars){
          setClicked(type);

     }

    }
    else {
      onBack()
      setClicked(type);
    };
  };


  const {mode}=useColorMode()
  return (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        pb:2, 
        maxWidth: 550,
        width: '100%',
        borderRadius: 0,
        backgroundColor:"transparent",
        backgroundImage:"none"
      }}
    >
      <Typography variant="body1" mb={2}>
        Here are a few car models you can consider:
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap">
         <Button
         variant='contained'
          // variant={clicked === 'show' ? 'contained' : 'outlined'}
          // color={clicked === 'show' ? 'primary' : 'inherit'}
           disabled={clicked !== '' || disabled}
          size="small"
          sx={{ textTransform: 'none', fontSize: 14 }}
          onClick={() => handleClick('show')}
        >
          Show Cars
        </Button>

        <Button
        variant='contained'
          // variant={clicked === 'back' ? 'contained' : 'outlined'}
          // color={clicked === 'back' ? 'primary' : 'inherit'}
           disabled={clicked !== '' || disabled}
          size="small"
          sx={{ textTransform: 'none', fontSize: 14 }}
          onClick={() => handleClick('back')}
        >
          Back
        </Button>
      </Stack>
    </Paper>
  );
};

export default OptionsCard;
