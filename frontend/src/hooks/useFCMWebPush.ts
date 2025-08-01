import { useEffect, useState } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';

export const useFCMWebPush = () => {
    // Persist notifications in localStorage so they survive refreshes
    const [notifications, setNotifications] = useState<{ title: string; body: string; read: boolean }[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('notifications');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    useEffect(() => {
        console.log('useEffect: notifications changed', notifications);
        // Save notifications to localStorage whenever they change
        localStorage.setItem('notifications', JSON.stringify(notifications));

    }, [notifications]);

    useEffect(() => {
        console.log('useEffect: component mounted');
        // Check for browser support
        if (
            typeof window === 'undefined' ||
            !('Notification' in window) ||
            !('serviceWorker' in navigator) ||
            !('PushManager' in window)
        ) {
            console.warn('This browser does not support FCM web push notifications.');
            return;
        }

        let unsubscribe: (() => void) | undefined;

        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                getToken(messaging, {
                    vapidKey: 'BPRz3bLk7DM2bmvcXrk5_v-LGWN5qtO_wCZvkQkuTd2bb6xsFlN0d2wgm7NER7i0zB5tzN07BiV5WZ9NwLHuM18',
                })
                    .then((currentToken) => {
                        if (currentToken) {
                            console.log('Web FCM Token:', currentToken);
                            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cargpt/store-token/`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ token: currentToken }),
                            });
                        } else {
                            console.warn('No registration token available. Request permission to generate one.');
                        }
                    })
                    .catch((err) => {
                        console.error('An error occurred while retrieving token.', err);
                    });

                // Handle foreground messages
                unsubscribe = onMessage(messaging, (payload) => {
                    console.log('Message received in foreground:', payload);
                    console.log('Notification data:', payload.notification);
                    console.log('Notification title:', payload.notification?.title);
                    console.log('Notification body:', payload.notification?.body);
                    setNotifications((prev) => {
                        const updated = [
                            {
                                title: payload.notification?.title ?? 'Notification',
                                body: payload.notification?.body ?? '',
                                read: false, // Add this line
                            },
                            ...prev,
                        ];
                        return updated;
                    });
                });
            }
        });

        // Cleanup function to remove the handler
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    useEffect(() => {
        const syncNotifications = () => {
            const saved = localStorage.getItem('notifications');
            if (saved) setNotifications(JSON.parse(saved));
        };

        // Listen for messages from the service worker (background notifications)
        const handleServiceWorkerMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'BACKGROUND_NOTIFICATION') {
                console.log('Received background notification from SW:', event.data.notification);
                setNotifications((prev) => {
                    const updated = [event.data.notification, ...prev];
                    return updated;
                });
            }
        };

        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        window.addEventListener('storage', syncNotifications);

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
            window.removeEventListener('storage', syncNotifications);
        };
    }, []);
     console.log("notification", notifications)
    return { notifications, setNotifications };
};

