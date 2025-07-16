import { useQuery, useMutation, useQueryClient } from "react-query";
import { indisponibiliteService } from "../services/api";

// Hook pour récupérer toutes les indisponibilités
export const useIndisponibilites = (filters = {}) => {
  return useQuery(["indisponibilites", filters], () => indisponibiliteService.getAll(filters), {
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // Cache de 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache de 10 minutes
  });
};

// Hook pour récupérer une indisponibilité par ID
export const useIndisponibilite = (id) => {
  return useQuery(["indisponibilite", id], () => indisponibiliteService.getById(id), {
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Hook pour récupérer les indisponibilités par employé
export const useIndisponibilitesByEmploye = (employeId) => {
  return useQuery(
    ["indisponibilites", employeId],
    () => indisponibiliteService.getByEmployeId(employeId),
    {
      select: (response) => response.data,
      enabled: !!employeId,
    }
  );
};

// Hook pour créer une indisponibilité
export const useCreateIndisponibilite = () => {
  const queryClient = useQueryClient();
  return useMutation((data) => indisponibiliteService.create(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["indisponibilites"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la création de l'indisponibilité:", error);
    },
  });
};

// Hook pour mettre à jour une indisponibilité
export const useUpdateIndisponibilite = () => {
  const queryClient = useQueryClient();
  return useMutation(({ id, data }) => indisponibiliteService.update(id, data), {
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(["indisponibilite", id], response);
      queryClient.invalidateQueries(["indisponibilites"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de l'indisponibilité:", error);
    },
  });
};

// Hook pour supprimer une indisponibilité
export const useDeleteIndisponibilite = () => {
  const queryClient = useQueryClient();
  return useMutation((id) => indisponibiliteService.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["indisponibilites"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression de l'indisponibilité:", error);
    },
  });
};