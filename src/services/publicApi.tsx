import axios, { AxiosInstance } from "axios";

const publicApi: AxiosInstance = axios.create({
  baseURL: "http://192.168.100.198:8592/api/v1",
  headers: { "Content-Type": "application/json" },
});

export default publicApi;
