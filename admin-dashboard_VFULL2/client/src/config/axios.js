import axios from "axios";

const useApiAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: false,
});

// useApiAxios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// useApiAxios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default useApiAxios;