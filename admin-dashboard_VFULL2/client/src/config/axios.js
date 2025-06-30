import axios from "axios";

const useApiAxios = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: false,
});

useApiAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

useApiAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default useApiAxios;