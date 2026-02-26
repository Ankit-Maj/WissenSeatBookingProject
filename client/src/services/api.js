import axios from "axios";

const API = axios.create({
  baseURL: "https://wissenseatbookingproject.onrender.com/api",
});

export default API;