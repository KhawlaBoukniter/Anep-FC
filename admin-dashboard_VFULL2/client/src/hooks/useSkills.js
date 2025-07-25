import { useQuery, useMutation, useQueryClient } from "react-query"
import { skillService } from "../services/api"

// Hook pour récupérer toutes les compétences
export const useSkills = (filters = {}) => {
  return useQuery(["skills", filters], () => skillService.getAll(filters), {
    select: (response) => Array.isArray(response.data) ? response.data : [],
    staleTime: 10 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
  });
};

// Hook pour créer une compétence
export const useCreateSkill = () => {
  const queryClient = useQueryClient()

  return useMutation((data) => skillService.create(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["skills"])
      queryClient.invalidateQueries(["latestSkillCode"])
    },
    onError: (error) => {
      console.error("Erreur lors de la création de la compétence:", error)
    },
  })
}

// Hook pour mettre à jour une compétence
export const useUpdateSkill = () => {
  const queryClient = useQueryClient()

  return useMutation(({ id, data }) => skillService.update(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["skills"])
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de la compétence:", error)
    },
  })
}

// Hook pour supprimer une compétence
export const useDeleteSkill = () => {
  const queryClient = useQueryClient()

  return useMutation((id) => skillService.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["skills"])
      queryClient.invalidateQueries(["latestSkillCode"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression de la compétence:", error)
    },
  })
}
