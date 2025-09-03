import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Chip } from '@mui/material';
import { checkPermission, checkAllPermissions, getPermissionStatus } from '@/utils/checkPermissions';

const PermissionExample: React.FC = () => {
  const [permissions, setPermissions] = useState({
    location: false,
    notifications: false
  });
  const [allGranted, setAllGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Check individual permissions
    const location = await checkPermission('location');
    const notifications = await checkPermission('notifications');
    
    setPermissions({ location, notifications });
    
    // Check if all permissions are granted
    const allGrantedResult = await checkAllPermissions();
    setAllGranted(allGrantedResult);
  };



  const handleLocationAction = async () => {
    if (permissions.location) {
      console.log('Location permission granted, proceeding with location action...');
      // Your location logic here
    } else {
      console.log('Location permission not granted');
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Permission Status
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Location: <Chip label={permissions.location ? '✅ Granted' : '❌ Not Granted'} size="small" color={permissions.location ? 'success' : 'error'} />
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Notifications: <Chip label={permissions.notifications ? '✅ Granted' : '❌ Not Granted'} size="small" color={permissions.notifications ? 'success' : 'error'} />
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          All Permissions: <Chip label={allGranted ? '✅ All Granted' : '❌ Some Missing'} size="small" color={allGranted ? 'success' : 'error'} />
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={handleLocationAction}
          disabled={!permissions.location}
        >
          Use Location
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={checkPermissions}
        >
          Refresh Status
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Permissions are automatically requested when the app loads. Check console for details.
      </Typography>
    </Box>
  );
};

export default PermissionExample;
