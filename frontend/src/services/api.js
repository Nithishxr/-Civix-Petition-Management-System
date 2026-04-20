import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api"
});

// 🔥 ADD THIS BLOCK
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  console.log("Sending Token:", token); // debug

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;