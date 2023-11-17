import axios from "axios";
import qs from "qs";

// export const baseurl = "localhost"
export const baseurl = "10.6.161.53"
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://"+baseurl+":5000";

axios.interceptors.request.use(
  (config) => {
    if (config.meth === "post" && !(config.data instanceof FormData)) {
      config.headers = {
        "Content-Type": "application/json",
      };
      config.data = qs.stringify(config.data, {
        arrayFormat: "repeat",
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (res) => {
    if(res.data.state == "5000"){
      return Promise.resolve(res);
    }
    if (res.status == 0 || res.status == 200 ) {
      return Promise.resolve(res);
    }
    
  },
  (err) => {
    return Promise.resolve(err);
  }
);

export default axios;
