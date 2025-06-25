import React from 'react';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';

interface OptionsCardProps {
  onBack: () => void;
  onShowCars: () => void;
}
const OptionsCard: React.FC<OptionsCardProps> = ({onBack, onShowCars}) => {
  return (
    
      <Paper
        elevation={2}
        sx={{
          p: 2,
          maxWidth: 550,
          width: '100%',
          backgroundColor: '#f5f5f5',
          
        }}
        style={{boxShadow: 'none', borderRadius: 0}}
      >
        <Typography variant="body1" mb={2}>
          Here are a few car models you can consider:
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', fontSize: 14 }}
            onClick={onShowCars}
          >
            Show Cars
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', fontSize: 14 }}
            onClick={onBack}
          >
            Back
          </Button>
        </Stack>
      </Paper>
    
  );
};

export default OptionsCard;
