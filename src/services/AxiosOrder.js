import axios from "axios";

const RemoveCredentials = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  window.location.href = "/login";
};

const instance = axios.create({
  baseURL: "http://ec2-13-235-51-151.ap-south-1.compute.amazonaws.com/",
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
