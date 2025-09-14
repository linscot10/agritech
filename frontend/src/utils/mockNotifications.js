// src/utils/mockNotifications.js
export const mockNotificationsData = {
  get: async (url) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockNotifications = [
      {
        _id: '1',
        title: 'New Order Received',
        message: 'You have received a new order for 50kg of organic tomatoes. Total: $249.50',
        type: 'order',
        isRead: false,
        createdAt: '2024-01-15T14:30:00Z'
      },
      {
        _id: '2',
        title: 'Irrigation Alert',
        message: 'Soil moisture levels are low (28%). Consider irrigating your fields today.',
        type: 'irrigation',
        isRead: false,
        createdAt: '2024-01-15T12:15:00Z'
      },
      {
        _id: '3',
        title: 'New Forum Reply',
        message: 'John Farmer replied to your post about organic pest control methods.',
        type: 'forum',
        isRead: true,
        createdAt: '2024-01-15T10:45:00Z'
      },
      {
        _id: '4',
        title: 'Order Shipped',
        message: 'Your order #ORD-12345 has been shipped and is on its way to the customer.',
        type: 'order',
        isRead: true,
        createdAt: '2024-01-14T16:20:00Z'
      },
      {
        _id: '5',
        title: 'Weather Advisory',
        message: 'Heavy rainfall expected tomorrow. Consider adjusting your irrigation schedule.',
        type: 'reminder',
        isRead: true,
        createdAt: '2024-01-14T14:00:00Z'
      },
      {
        _id: '6',
        title: 'System Update',
        message: 'New features have been added to your dashboard. Check them out!',
        type: 'general',
        isRead: true,
        createdAt: '2024-01-13T09:30:00Z'
      },
      {
        _id: '7',
        title: 'Inventory Low',
        message: 'Your stock of organic wheat is running low (only 15kg remaining).',
        type: 'reminder',
        isRead: false,
        createdAt: '2024-01-13T08:15:00Z'
      },
      {
        _id: '8',
        title: 'New Follower',
        message: 'Sarah Grower started following your farm profile.',
        type: 'forum',
        isRead: true,
        createdAt: '2024-01-12T17:45:00Z'
      }
    ];

    return { data: mockNotifications };
  },
  
  put: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (url.includes('/read')) {
      const notificationId = url.split('/')[2];
      return { 
        data: { 
          _id: notificationId,
          isRead: true 
        } 
      };
    }
    
    return { data: {} };
  },
  
  delete: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true } };
  }
};