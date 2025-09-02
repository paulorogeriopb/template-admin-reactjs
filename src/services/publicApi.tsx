import axios, { AxiosInstance } from "axios";

const publicApi: AxiosInstance = axios.create({
  //Trabalho
  baseURL: "http://192.168.250.154:8592/api/v1",
  //Casa
  //baseURL: "http://192.168.100.198:8592/api/v1",
  //laravel Octane
  //baseURL: "http://192.168.100.198:8073/api/v1",
  headers: { "Content-Type": "application/json" },
});

export default publicApi;
