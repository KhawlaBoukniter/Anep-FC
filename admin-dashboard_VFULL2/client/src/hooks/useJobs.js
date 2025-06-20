import { useQuery, useMutation, useQueryClient } from "react-query";
import { jobService } from "../services/api";

// Hook pour récupérer tous les emplois
export const useJobs = (filters = {}) => {
  return useQuery(["jobs", filters], () => jobService.getAll(filters), {
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook pour récupérer un emploi par ID
export const useJob = (id) => {
  return useQuery(["job", id], () => jobService.getById(id), {
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Hook pour créer un emploi
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation((data) => jobService.create(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["jobs"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la création de l'emploi:", error);
    },
  });
};

// Hook pour mettre à jour un emploi
export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation(({ id, data }) => jobService.update(id, data), {
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(["job", id], response);
      queryClient.invalidateQueries(["jobs"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de l'emploi:", error);
    },
  });
};

// Hook pour supprimer un emploi
export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation((id) => jobService.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["jobs"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression de l'emploi:", error);
    },
  });
};

// Hook pour archiver un emploi
export const useArchiveJob = () => {
  const queryClient = useQueryClient();

  return useMutation((id) => jobService.archive(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["jobs"]);
    },
    onError: (error) => {
      console.error("Erreur lors de l'archivage de l'emploi:", error);
    },
  });
};

// Hook pour désarchiver un emploi
export const useUnarchiveJob = () => {
  const queryClient = useQueryClient();

  return useMutation((id) => jobService.unarchive(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["jobs"]);
    },
    onError: (error) => {
      console.error("Erreur lors du désarchivage de l'emploi:", error);
    },
  });
};