import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

const instance: AxiosInstance = axios.create({
  //Trabalho
  //baseURL: "http://192.168.250.154:8592/api/v1",
  //Casa
  //baseURL: "http://192.168.100.198:8592/api/v1",
  //laravel Octane
  baseURL: "http://192.168.100.198:8073/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Interceptor para adicionar o token automaticamente nas requisições
instance.interceptors.request.use(
  (config) => {
    // Verifica se está no cliente antes de acessar o localStorage
    if (typeof window !== "undefined") {
      // Recuperar o token
      const token = localStorage.getItem("token");

      // Verificar se existe o token
      if (token) {
        // Acrecentar o token no Authorization
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Retornar as configurações
    return config;
  },
  (error) => {
    // Retornar erro
    return Promise.reject(error);
  }
);

// Exportar a instância do Axios para ser utilizada em outras partes do projeto
export default instance;
