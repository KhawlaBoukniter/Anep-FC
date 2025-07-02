import { useQuery } from "react-query";
import api from "../services/api";
import { Profile } from "../types/employee"; 

export const useProfilesPG = () => {
  return useQuery("pg-profiles", async () => {
    const response = await api.get("/employee-profiles");
    return response.data.map((profile: Profile) => ({
      ...profile,
      _id: profile.id_profile?.toString(),
      name: profile["NOM PRENOM"],
    }));
  });
};