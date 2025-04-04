// client/src/api.js
import axios from "axios";

export const getInviteData = () => {
  return axios.get('http://localhost:5000/api/invite')
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching invite data:', error);
      throw error;
    });
}

// Create an instance of axios with the base URL from environment variables
const API = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });

// API call to add a document
export const addDocument = (documentData) => API.post("/api/documents/addDocument", documentData);

// API call to get a specific document by ID
export const getDocument = (id) => API.get(`/api/documents/getDocument/${id}`);

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Update with your API base URL
    timeout: 10000, // Set a 10-second timeout
  });
  
  export default apiClient;