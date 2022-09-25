import axios from "axios";

const RemoveCredentials = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  window.location.href = "/login";
};

const instance = axios.create({
  baseURL: "https://a5c3-2405-201-5509-4a9b-44a1-6c94-53e0-ac93.ngrok.io/",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

instance.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
});

instance.interceptors.response.use(
  undefined,
  function axiosRetryInterceptor(err) {
    if (err.response.status === 401) {
      RemoveCredentials();
    }
    return Promise.reject(err);
  }
);

export default instance;
