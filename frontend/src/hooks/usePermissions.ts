"use client";
import { useState, useEffect } from 'react';
import { permissionsManager, PermissionStatus } from '@/utils/permissionsManager';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    location: 'unavailable',
    notifications: 'unavailable'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      setIsLoading(true);
      const status = await permissionsManager.checkPermissionStatus();
      setPermissions(status);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permissionType: 'location' | 'notifications') => {
    return permissions[permissionType] === 'granted';
  };

  const allPermissionsGranted = Object.values(permissions).every(
    status => status === 'granted' || status === 'unavailable'
  );

  return {
    permissions,
    isLoading,
    checkPermissions,
    hasPermission,
    allPermissionsGranted
  };
};
