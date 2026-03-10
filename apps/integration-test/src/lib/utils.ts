import axios from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error) => error.response,
);

export default axios;
