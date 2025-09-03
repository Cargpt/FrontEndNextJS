import { permissionsManager } from './permissionsManager';

/**
 * Simple utility to check if a specific permission is granted
 */
export const checkPermission = async (permissionType: 'location' | 'notifications'): Promise<boolean> => {
  try {
    const status = await permissionsManager.checkPermissionStatus();
    return status[permissionType] === 'granted';
  } catch (error) {
    console.error(`Failed to check ${permissionType} permission:`, error);
    return false;
  }
};

/**
 * Check if all permissions are granted
 */
export const checkAllPermissions = async (): Promise<boolean> => {
  try {
    const status = await permissionsManager.checkPermissionStatus();
    return Object.values(status).every(permission => permission === 'granted' || permission === 'unavailable');
  } catch (error) {
    console.error('Failed to check all permissions:', error);
    return false;
  }
};

/**
 * Get current permission status
 */
export const getPermissionStatus = async () => {
  try {
    return await permissionsManager.checkPermissionStatus();
  } catch (error) {
    console.error('Failed to get permission status:', error);
    return {
      location: 'unavailable',
      notifications: 'unavailable'
    };
  }
};
