import { useQuery, useMutation, useQueryClient } from "react-query";
import { reqSkillService } from "../services/api";

// Hook pour récupérer toutes les compétences
export const useSkills = (filters = {}) => {
  return useQuery(["req-skills", filters], () => reqSkillService.getAll(filters), {
    select: (response) => Array.isArray(response.data) ? response.data : [],
    staleTime: 10 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
  });
};

// Hook pour créer une compétence
export const useCreateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation((data) => reqSkillService.create(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["req-skills"]);
      queryClient.invalidateQueries(["latestReqSkillCode"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la création de la compétence:", error);
    },
  });
};

// Hook pour mettre à jour une compétence
export const useUpdateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation(({ id, data }) => reqSkillService.update(id, data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["req-skills"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de la compétence:", error);
    },
  });
};

// Hook pour supprimer une compétence
export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation((id) => reqSkillService.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["req-skills"]);
      queryClient.invalidateQueries(["latestReqSkillCode"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression de la compétence:", error);
    },
  });
};

// Hook pour archiver une compétence
export const useArchiveSkill = () => {
  const queryClient = useQueryClient();

  return useMutation((id) => reqSkillService.archive(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["req-skills"]);
    },
    onError: (error) => {
      console.error("Erreur lors de l'archivage de la compétence:", error);
    },
  });
};

// Hook pour désarchiver une compétence
export const useUnarchiveSkill = () => {
  const queryClient = useQueryClient();

  return useMutation((id) => reqSkillService.unarchive(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["req-skills"]);
    },
    onError: (error) => {
      console.error("Erreur lors du désarchivage de la compétence:", error);
    },
  });
};

// Hook pour récupérer le dernier code de compétence
export const useLatestSkillCode = () => {
  return useQuery(
    ["latestReqSkillCode"],
    () => reqSkillService.getLatestCode(),
    {
      select: (response) => response.data.latestCode,
      staleTime: 10 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
    }
  );
};