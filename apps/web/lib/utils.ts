import axios from "axios";
import { BASE_URL } from "./config";

export async function getProblems(page: number, cookieStore: any) {
  const cookieHeader = Array.from(cookieStore._parsed.values())
    .map(({ name, value }: any) => {
      return `${name}=${encodeURIComponent(value)}`;
    })
    .join("; ");
  const problems = await axios.get(`${BASE_URL}/api/user/problems?page=${page}`, {
    headers: {
      "cookie": cookieHeader
    }
  });
  return problems;
}

export async function getAllTags() {
  const allTags = axios.get(`${BASE_URL}/api/tags/getAll`);
  return allTags;
}
