import axios, { AxiosInstance } from "axios";

const publicApi: AxiosInstance = axios.create({
  //Trabalho - laravel Normal
  //baseURL: "http://192.168.250.154:8592/api/v1",

  //Casa - laravel Normal
  //baseURL: "http://192.168.100.198:8592/api/v1",

  //laravel Octane Trabalho
  //baseURL: "http://192.168.250.154:8073/api/v1",

  //laravel Octane Casa
  baseURL: "http://192.168.100.198:8073/api/v1",

  headers: { "Content-Type": "application/json" },
});

export default publicApi;
