import axios from "axios";

const ENV = import.meta.env.MODE;

const baseURL =
  ENV === "development"
    ? "http://localhost:8000/api" // fallback for dev
    : import.meta.env.VITE_API_URL || "https://ai-employee-manager.onrender.com/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

console.log("Running mode:", ENV, " | Axios Base URL:", baseURL);

export default api;
