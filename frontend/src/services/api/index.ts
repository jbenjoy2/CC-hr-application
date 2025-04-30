import api from "../axios";

export async function getAllEmployees() {
  const res = await api.get("/employees");
  console.log({ res });
  return res.data;
}
