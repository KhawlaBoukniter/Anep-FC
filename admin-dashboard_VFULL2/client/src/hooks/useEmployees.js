import { useQuery, useMutation, useQueryClient } from "react-query";
import { employeeService } from "../services/api";

// Hook pour récupérer tous les employés
export const useEmployees = (filters = {}) => {
  return useQuery(["employees", filters], () => employeeService.getAll(filters), {
    select: (response) => {
      return response.data.map((employee) => ({
        ...employee,
        profile: employee.profile || null,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour récupérer un employé par ID
export const useEmployee = (id) => {
  return useQuery(["employee", id], () => employeeService.getById(id), {
    select: (response) => ({
      ...response.data,
      profile: response.data.profile || null,
    }),
    enabled: !!id,
  });
};

// Hook pour créer un employé
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const existingSkills = data.competences
        .filter((skill) => skill.id_competencea >= 0)
        .map((skill) => ({
          id_competencea: skill.id_competencea,
          niveaua: skill.niveaua,
        }));

      const finalData = {
        ...data,
        competences: existingSkills,
        profile: {
          "NOM PRENOM": data.profile["NOM PRENOM"],
          ADRESSE: data.profile.ADRESSE || null,
          DATE_NAISS: data.profile.DATE_NAISS,
          DAT_REC: data.profile.DAT_REC,
          CIN: data.profile.CIN,
          DETACHE: data.profile.DETACHE || null,
          SEXE: data.profile.SEXE,
          SIT_F_AG: data.profile.SIT_F_AG || null,
          STATUT: data.profile.STATUT || null,
          DAT_POS: data.profile.DAT_POS || null,
          LIBELLE_GRADE: data.profile.LIBELLE_GRADE || null,
          GRADE_ASSIMILE: data.profile.GRADE_ASSIMILE || null,
          LIBELLE_FONCTION: data.profile.LIBELLE_FONCTION || null,
          DAT_FCT: data.profile.DAT_FCT || null,
          LIBELLE_LOC: data.profile.LIBELLE_LOC || null,
          LIBELLE_REGION: data.profile.LIBELLE_REGION || null,
        },
      };

      return employeeService.create(finalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la création de l'employé:", error.response?.data || error.message);
    },
  });
};

/**
 * @typedef {import('../types/employee').Employee} Employee
 */

/**
 * Hook to update an employee
 * @returns {import('@tanstack/react-query').UseMutationResult<Employee, Error, { id: number; data: Employee }, unknown>}
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const finalData = {
        ...data,
        profile_id: data.profile?.profile_id || data.profile_id,
        competences: data.competences || [],
        emplois: data.emplois || [],
        profile: data.profile || {},
      };

      return employeeService.update(id, finalData);
    },
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(["employee", id], response);
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (error) => {
      console.error("Error updating employee:", error);
    },
  });
}

// Hook pour supprimer un employé
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation((id) => employeeService.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression de l'employé:", error);
    },
  });
};

export const useArchiveEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation((id) => employeeService.archive(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (error) => {
      console.error("Erreur lors de l'archivage de l'employé:", error);
    },
  });
};

export const useUnarchiveEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation((id) => employeeService.unarchive(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (error) => {
      console.error("Erreur lors du désarchivage de l'employé:", error);
    },
  });
};