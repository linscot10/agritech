// src/utils/mockPrograms.js
export const mockProgramsData = {
  get: async (url) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockPrograms = [
      {
        _id: '1',
        title: 'Organic Farming Subsidy Program',
        description: 'Financial support for farmers transitioning to organic farming practices. Includes training and certification assistance.',
        type: 'SUBSIDY',
        eligibility: 'Farmers with minimum 2 years experience, land ownership documents, and commitment to organic practices',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        createdBy: { _id: 'admin1', name: 'Admin User' },
        applicants: [
          { farmer: { _id: 'user1', name: 'John Farmer' }, status: 'APPROVED', appliedAt: '2024-01-15' },
          { farmer: { _id: 'user2', name: 'Sarah Grower' }, status: 'APPLIED', appliedAt: '2024-01-20' }
        ],
        createdAt: '2024-01-01'
      },
      {
        _id: '2',
        title: 'Modern Irrigation Training',
        description: 'Free training program on modern irrigation techniques and water conservation methods.',
        type: 'TRAINING',
        eligibility: 'All farmers interested in improving irrigation efficiency',
        startDate: '2024-02-01',
        endDate: '2024-02-28',
        createdBy: { _id: 'admin1', name: 'Admin User' },
        applicants: [
          { farmer: { _id: 'user3', name: 'Mike Agric' }, status: 'APPROVED', appliedAt: '2024-01-18' }
        ],
        createdAt: '2024-01-05'
      },
      {
        _id: '3',
        title: 'Small Farm Grant Initiative',
        description: 'Grant funding for small-scale farmers to purchase equipment and improve infrastructure.',
        type: 'GRANT',
        eligibility: 'Small-scale farmers (less than 10 acres), proof of farming activity, business plan required',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        createdBy: { _id: 'admin1', name: 'Admin User' },
        applicants: [],
        createdAt: '2024-01-10'
      }
    ];

    return { data: { programs: mockPrograms } };
  },
  
  post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (url.includes('/apply')) {
      return { data: { success: true, message: 'Application submitted successfully' } };
    }
    
    // For new program creation
    const newProgram = {
      _id: 'newprogram',
      ...data,
      createdBy: { _id: 'currentuser', name: 'Current User' },
      applicants: [],
      createdAt: new Date().toISOString()
    };
    
    return { data: newProgram };
  },
  
  put: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { data: { ...data, _id: url.split('/')[2] } };
  },
  
  delete: async (url) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true } };
  }
};