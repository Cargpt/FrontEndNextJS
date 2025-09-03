"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { permissionsManager, PermissionStatus } from '@/utils/permissionsManager';
import { Capacitor } from '@capacitor/core';

interface PermissionsRequestProps {
  onComplete?: (permissions: PermissionStatus) => void;
  showOnLoad?: boolean;
  autoRequest?: boolean;
}

const PermissionsRequest: React.FC<PermissionsRequestProps> = ({
  onComplete,
  showOnLoad = true,
  autoRequest = false
}) => {
  const [isVisible, setIsVisible] = useState(showOnLoad);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    camera: 'unavailable',
    location: 'unavailable',
    notifications: 'unavailable'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (showOnLoad) {
      checkPermissions();
    }
  }, [showOnLoad]);

  useEffect(() => {
    if (autoRequest && isVisible) {
      handleRequestAll();
    }
  }, [autoRequest, isVisible]);

  const checkPermissions = async () => {
    try {
      const status = await permissionsManager.checkPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    }
  };

  const handleRequestPermission = async (permissionType: 'camera' | 'location' | 'notifications') => {
    setIsLoading(true);
    setCurrentRequest(permissionType);

    try {
      let result: 'granted' | 'denied' | 'unavailable';

      switch (permissionType) {
        case 'camera':
          result = await permissionsManager.requestCameraPermission();
          break;
        case 'location':
          result = await permissionsManager.requestLocationPermission();
          break;
        case 'notifications':
          result = await permissionsManager.requestNotificationsPermission();
          break;
      }

      setPermissionStatus(prev => ({
        ...prev,
        [permissionType]: result
      }));

      // Check if all permissions are granted
      const newStatus = { ...permissionStatus, [permissionType]: result };
      if (Object.values(newStatus).every(status => status === 'granted' || status === 'unavailable')) {
        onComplete?.(newStatus);
      }

    } catch (error) {
      console.error(`Failed to request ${permissionType} permission:`, error);
    } finally {
      setIsLoading(false);
      setCurrentRequest('');
    }
  };

  const handleRequestAll = async () => {
    setIsLoading(true);
    setCurrentRequest('all');

    try {
      const result = await permissionsManager.requestPermissions({
        camera: true,
        location: true,
        notifications: true
      });

      setPermissionStatus(result);
      onComplete?.(result);

    } catch (error) {
      console.error('Failed to request all permissions:', error);
    } finally {
      setIsLoading(false);
      setCurrentRequest('');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const getPermissionIcon = (type: 'camera' | 'location' | 'notifications') => {
    switch (type) {
      case 'camera':
        return <CameraIcon />;
      case 'location':
        return <LocationIcon />;
      case 'notifications':
        return <NotificationsIcon />;
    }
  };

  const getPermissionTitle = (type: 'camera' | 'location' | 'notifications') => {
    switch (type) {
      case 'camera':
        return 'Camera Access';
      case 'location':
        return 'Location Access';
      case 'notifications':
        return 'Push Notifications';
    }
  };

  const getPermissionDescription = (type: 'camera' | 'location' | 'notifications') => {
    switch (type) {
      case 'camera':
        return 'Take photos of cars and documents for better recommendations';
      case 'location':
        return 'Find car dealers and services near you';
      case 'notifications':
        return 'Get updates on car deals and recommendations';
    }
  };

  const getPermissionStatusColor = (status: 'granted' | 'denied' | 'prompt' | 'unavailable') => {
    switch (status) {
      case 'granted':
        return 'success';
      case 'denied':
        return 'error';
      case 'prompt':
        return 'warning';
      case 'unavailable':
        return 'default';
      default:
        return 'default';
    }
  };

  if (!isVisible) return null;

  const allGranted = Object.values(permissionStatus).every(
    status => status === 'granted' || status === 'unavailable'
  );

  return (
    <>
      <Card 
        sx={{ 
          maxWidth: isMobile ? '100%' : 600, 
          mx: 'auto', 
          mb: 3,
          boxShadow: theme.shadows[4],
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              App Permissions
            </Typography>
            <Box>
              <Tooltip title="Help">
                <IconButton onClick={() => setShowHelp(true)} size="small">
                  <HelpIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={handleClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            AiCarAdvisor needs these permissions to provide you with the best experience.
          </Typography>

          {isLoading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                Requesting {currentRequest === 'all' ? 'permissions' : currentRequest}...
              </Typography>
            </Box>
          )}

          <Stack spacing={2} sx={{ mb: 3 }}>
            {(['camera', 'location', 'notifications'] as const).map((permission) => (
              <Box
                key={permission}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.paper
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {getPermissionIcon(permission)}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {getPermissionTitle(permission)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getPermissionDescription(permission)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={permissionsManager.getPermissionStatusText(permissionStatus[permission])}
                    color={getPermissionStatusColor(permissionStatus[permission])}
                    size="small"
                    variant="outlined"
                  />
                  
                  {permissionStatus[permission] === 'prompt' && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleRequestPermission(permission)}
                      disabled={isLoading}
                      sx={{ minWidth: 80 }}
                    >
                      Allow
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Stack>

          {!allGranted && (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleRequestAll}
                disabled={isLoading}
                sx={{ minWidth: 200 }}
              >
                Allow All Permissions
              </Button>
            </Box>
          )}

          {allGranted && (
            <Alert severity="success" sx={{ mt: 2 }}>
              🎉 All permissions granted! You're all set to use AiCarAdvisor.
            </Alert>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
            Platform: {Capacitor.getPlatform()} | Native: {Capacitor.isNativePlatform() ? 'Yes' : 'No'}
          </Typography>
        </CardContent>
      </Card>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpIcon color="primary" />
            Permission Help
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            <strong>Camera:</strong> Used to take photos of cars, documents, or scan QR codes for quick access to car information.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Location:</strong> Helps find nearby car dealerships, service centers, and provides location-based recommendations.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Notifications:</strong> Keeps you updated with car deals, price drops, and personalized recommendations.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can change these permissions later in your device settings.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelp(false)}>Got it</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PermissionsRequest;
