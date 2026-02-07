// Demo data for offline/development mode
export const demoData = {
    user: {
        id: 'demo-user-123',
        email: 'demo@fridgefriend.com',
        name: 'Demo User'
    },
    products: [
        {
            id: 1,
            product_name: 'Fresh Carrots',
            quantity: 2,
            unit: 'kg',
            expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
            category: 'Vegetables',
            storage_location: 'Fridge Drawer',
            user_id: 'demo-user-123'
        },
        {
            id: 2,
            product_name: 'Organic Milk',
            quantity: 1,
            unit: 'liter',
            expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days
            category: 'Dairy',
            storage_location: 'Main Shelf',
            user_id: 'demo-user-123'
        },
        {
            id: 3,
            product_name: 'Chicken Breast',
            quantity: 500,
            unit: 'grams',
            expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days
            category: 'Meat',
            storage_location: 'Freezer',
            user_id: 'demo-user-123'
        },
        {
            id: 4,
            product_name: 'Greek Yogurt',
            quantity: 2,
            unit: 'cups',
            expiry_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days
            category: 'Dairy',
            storage_location: 'Main Shelf',
            user_id: 'demo-user-123'
        },
        {
            id: 5,
            product_name: 'Tomatoes',
            quantity: 4,
            unit: 'pieces',
            expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days
            category: 'Vegetables',
            storage_location: 'Counter',
            user_id: 'demo-user-123'
        },
        {
            id: 6,
            product_name: 'Eggs',
            quantity: 12,
            unit: 'pieces',
            expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days
            category: 'Dairy',
            storage_location: 'Door Shelf',
            user_id: 'demo-user-123'
        },
        {
            id: 7,
            product_name: 'Bell Peppers',
            quantity: 3,
            unit: 'pieces',
            expiry_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days
            category: 'Vegetables',
            storage_location: 'Fridge Drawer',
            user_id: 'demo-user-123'
        },
        {
            id: 8,
            product_name: 'Cheddar Cheese',
            quantity: 300,
            unit: 'grams',
            expiry_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days
            category: 'Dairy',
            storage_location: 'Main Shelf',
            user_id: 'demo-user-123'
        }
    ],
    recipes: [
        {
            id: 1,
            title: 'Quick Chicken Stir Fry',
            ingredients: ['Chicken Breast', 'Bell Peppers', 'Tomatoes'],
            instructions: '1. Cook chicken\n2. Add peppers\n3. Add tomatoes\n4. Season and serve',
            cookTime: '20 mins',
            servings: 2,
            difficulty: 'Easy'
        },
        {
            id: 2,
            title: 'Fresh Vegetable Salad',
            ingredients: ['Bell Peppers', 'Tomatoes', 'Carrots'],
            instructions: '1. Chop vegetables\n2. Mix together\n3. Add dressing\n4. Serve fresh',
            cookTime: '10 mins',
            servings: 2,
            difficulty: 'Easy'
        },
        {
            id: 3,
            title: 'Veggie Omelette',
            ingredients: ['Eggs', 'Bell Peppers', 'Tomatoes'],
            instructions: '1. Beat eggs\n2. Heat pan\n3. Add vegetables\n4. Pour eggs and cook',
            cookTime: '15 mins',
            servings: 1,
            difficulty: 'Easy'
        }
    ],
    communityPosts: [
        {
            id: 1,
            title: 'Best way to store fresh carrots?',
            author: 'Sarah M.',
            content: 'I just bought fresh carrots and want to keep them crisp. Any tips?',
            replies: 3,
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            title: 'Anyone have good chicken recipes?',
            author: 'John D.',
            content: 'Looking for quick and easy chicken recipes. What are your favorites?',
            replies: 5,
            date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            title: 'How long does milk last after opening?',
            author: 'Emma L.',
            content: 'Want to make sure I use my milk before it expires.',
            replies: 2,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    donations: [
        {
            id: 1,
            title: 'Weekly Food Drive',
            description: 'Donate fresh vegetables and dairy products',
            location: 'Community Center',
            date: '2024-02-15'
        },
        {
            id: 2,
            title: 'Help Local Food Bank',
            description: 'Support local families in need',
            location: 'Food Bank Downtown',
            date: '2024-02-20'
        }
    ]
};

// Function to check if using demo mode (no database connection)
export const isDemoMode = () => {
    // Check if explicitly set in localStorage or if database calls are failing
    return localStorage.getItem('demoMode') === 'true';
};

// Function to enable demo mode
export const enableDemoMode = () => {
    localStorage.setItem('demoMode', 'true');
};

// Function to disable demo mode
export const disableDemoMode = () => {
    localStorage.removeItem('demoMode');
};
