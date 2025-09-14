// src/utils/mockForum.js
export const mockForumData = {
  get: async (url) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockPosts = [
      {
        _id: '1',
        title: 'Best practices for organic tomato farming',
        content: 'I\'ve been growing organic tomatoes for 5 years and would like to share some tips:\n\n1. Use compost tea for natural fertilization\n2. Rotate crops every season\n3. Use companion planting with basil\n4. Monitor soil pH regularly\n\nWhat are your experiences?',
        user: {
          _id: 'user1',
          name: 'John Farmer',
          email: 'john@example.com'
        },
        comments: [
          {
            _id: 'comment1',
            text: 'Great tips! I also found that using mulch helps retain moisture.',
            user: {
              _id: 'user2',
              name: 'Sarah Grower',
              email: 'sarah@example.com'
            },
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            _id: 'comment2',
            text: 'How often do you water your tomatoes?',
            user: {
              _id: 'user3',
              name: 'Mike Agric',
              email: 'mike@example.com'
            },
            createdAt: '2024-01-15T14:20:00Z'
          }
        ],
        likes: ['user2', 'user3', 'user4'],
        createdAt: '2024-01-15T08:00:00Z'
      },
      {
        _id: '2',
        title: 'Dealing with pest problems in maize',
        content: 'I\'m having issues with pests in my maize field. Any organic solutions that have worked for you? I\'ve tried neem oil but looking for other options.',
        user: {
          _id: 'user2',
          name: 'Sarah Grower',
          email: 'sarah@example.com'
        },
        comments: [
          {
            _id: 'comment3',
            text: 'I use a garlic and chili spray that works well for me.',
            user: {
              _id: 'user1',
              name: 'John Farmer',
              email: 'john@example.com'
            },
            createdAt: '2024-01-14T16:45:00Z'
          }
        ],
        likes: ['user1', 'user4'],
        createdAt: '2024-01-14T15:30:00Z'
      },
      {
        _id: '3',
        title: 'Irrigation scheduling during dry season',
        content: 'With the dry season approaching, how are you adjusting your irrigation schedules? I\'m looking for water-efficient methods.',
        user: {
          _id: 'user3',
          name: 'Mike Agric',
          email: 'mike@example.com'
        },
        comments: [],
        likes: ['user1', 'user2'],
        createdAt: '2024-01-13T09:15:00Z'
      }
    ];

    return { data: mockPosts };
  },
  
  post: async (url, data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (url.includes('/like')) {
      return { data: { likes: ['user1', 'user2', 'user3'] } };
    }
    
    if (url.includes('/comments')) {
      return {
        data: {
          ...mockPosts[0],
          comments: [
            ...mockPosts[0].comments,
            {
              _id: 'newcomment',
              text: data.text,
              user: {
                _id: 'currentuser',
                name: 'Current User',
                email: 'current@example.com'
              },
              createdAt: new Date().toISOString()
            }
          ]
        }
      };
    }
    
    // For new posts
    const newPost = {
      _id: 'newpost',
      title: data.title,
      content: data.content,
      user: {
        _id: 'currentuser',
        name: 'Current User',
        email: 'current@example.com'
      },
      comments: [],
      likes: [],
      createdAt: new Date().toISOString()
    };
    
    return { data: newPost };
  }
};