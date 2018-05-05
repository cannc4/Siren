import axios from 'axios';
       axios.defaults.timeout = 50000;
       axios.defaults.baseURL = "http://localhost:3001/";

export default axios;