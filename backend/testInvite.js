const axios = require('axios');

const sendInvitations = async () => {
    const payload = {
        teams: [
            { name: 'Party A', teamHead: 'headA@example.com', members: ['member1A@example.com'] },
            { name: 'Party B', teamHead: 'headB@example.com', members: ['member1B@example.com'] },
        ],
    };

    try {
        const response = await axios.post('http://localhost:5000/invite', payload, {
            headers: { 'Content-Type': 'application/json' },
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

sendInvitations();
