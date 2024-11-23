// import axios from "axios";
// import { retrieveTokenFromStorage } from ".././utils/helpers";

// const axiosInstance = axios.create({
//   baseURL: process.env.BASE_URL,
//   headers: {
//     "Content-type": "application/json",
//   },
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = retrieveTokenFromStorage();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;
