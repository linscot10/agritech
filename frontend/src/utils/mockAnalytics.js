// src/utils/mockAnalytics.js
export const mockAnalyticsData = {
  get: async (url) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockData = {
      sales: [
        { _id: 'pending', totalOrders: 12, totalRevenue: 1250.50 },
        { _id: 'confirmed', totalOrders: 45, totalRevenue: 5678.25 },
        { _id: 'shipped', totalOrders: 32, totalRevenue: 4231.75 },
        { _id: 'delivered', totalOrders: 89, totalRevenue: 11234.90 },
        { _id: 'cancelled', totalOrders: 5, totalRevenue: 450.00 }
      ],
      topProducts: [
        { 
          _id: { _id: '1', name: 'Organic Tomatoes', price: 4.99 }, 
          totalQuantity: 245, 
          totalRevenue: 1222.55 
        },
        { 
          _id: { _id: '2', name: 'Fresh Maize', price: 2.49 }, 
          totalQuantity: 189, 
          totalRevenue: 470.61 
        },
        { 
          _id: { _id: '3', name: 'Premium Wheat', price: 3.99 }, 
          totalQuantity: 156, 
          totalRevenue: 622.44 
        },
        { 
          _id: { _id: '4', name: 'Organic Potatoes', price: 1.99 }, 
          totalQuantity: 278, 
          totalRevenue: 553.22 
        },
        { 
          _id: { _id: '5', name: 'Fresh Carrots', price: 2.29 }, 
          totalQuantity: 167, 
          totalRevenue: 382.43 
        }
      ],
      irrigation: [
        { _id: { day: 1, month: 1 }, avgMoisture: 45.2, avgWaterUsed: 1250 },
        { _id: { day: 2, month: 1 }, avgMoisture: 42.8, avgWaterUsed: 1180 },
        { _id: { day: 3, month: 1 }, avgMoisture: 38.5, avgWaterUsed: 1350 },
        { _id: { day: 4, month: 1 }, avgMoisture: 41.2, avgWaterUsed: 1220 },
        { _id: { day: 5, month: 1 }, avgMoisture: 47.8, avgWaterUsed: 980 },
        { _id: { day: 6, month: 1 }, avgMoisture: 39.5, avgWaterUsed: 1420 },
        { _id: { day: 7, month: 1 }, avgMoisture: 43.2, avgWaterUsed: 1150 }
      ],
      forum: {
        posts: 156,
        comments: 423
      }
    };

    return { data: mockData };
  }
};