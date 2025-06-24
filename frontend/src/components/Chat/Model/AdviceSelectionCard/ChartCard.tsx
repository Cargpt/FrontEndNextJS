import React from 'react';
import { Box, Paper, Typography, Button, Stack } from '@mui/material';

const ChatCard: React.FC = () => {
  return (
    <Box mt={3} mb={5} display="flex" justifyContent="flex-start">
      <Paper
        elevation={2}
        sx={{
          p: 2,
          maxWidth: 550,
          width: '100%',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Typography variant="body1" mb={2}>
          Here are a few car models you can consider:
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', fontSize: 14 }}
            onClick={() => console.log('Show Cars')}
          >
            Show Cars
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', fontSize: 14 }}
            onClick={() => console.log('Back')}
          >
            Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ChatCard;
