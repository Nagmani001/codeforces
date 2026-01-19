import axios from "axios";
import { BASE_URL } from "./config";

export async function getProblems(page: number) {
  const problems = await axios.get(`${BASE_URL}/api/user/problems?page=${page}`);
  return problems;
}
