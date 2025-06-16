import { useQuery, useMutation, useQueryClient } from "react-query"
// import { Employee } from "../types/employee.ts";
import { employeeService } from "../services/api"


// Hook pour récupérer tous les employés
export const useEmployees = (filters = {}) => {
  return useQuery(["employees", filters], () => employeeService.getAll(filters), {
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook pour récupérer un employé par ID
export const useEmployee = (id) => {
  return useQuery(["employee", id], () => employeeService.getById(id), {
    select: (response) => response.data,
    enabled: !!id,
  })
}

// Hook pour créer un employé
// export const useCreateEmployee = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     /**
//      * @param {{ [key: string]: any }} data
//      */
//     mutationFn: async (data) => employeeService.create(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["employees"])
//     },
//     onError: (error) => {
//       console.error("Erreur lors de la création de l'employé:", error)
//     },
//   })
// }

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const newSkills = data.competences.filter((skill) => skill.id_competencea < 0);
      const existingSkills = data.competences.filter((skill) => skill.id_competencea >= 0);

      const createdSkills = [];
      for (const skill of newSkills) {
        const response = await employeeService.createSkill({
          code_competencea: skill.code_competencea,
          competencea: skill.competencea,
        });
        createdSkills.push({
          id_competencea: response.data.id_competencea,
          niveaua: skill.niveaua,
        });
      }

      const allSkills = [
        ...existingSkills.map((skill) => ({
          id_competencea: skill.id_competencea,
          niveaua: skill.niveaua,
        })),
        ...createdSkills,
      ];

      const finalData = {
        ...data,
        competences: allSkills,
      };

      return employeeService.create(finalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["skills"]);
    },
    onError: (error) => {
      console.error("Erreur lors de la création de l'employé:", error);
    },
  });
};

/**
 * @typedef {import('../types/employee').Employee} Employee
 */

/**
 * Hook to update an employee
 * @returns {import('@tanstack/react-query').UseMutationResult<Employee, Error, { id: string; data: Employee }, unknown>}
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const newSkills = data.competences.filter((skill) => skill.id_competencea < 0);
      const existingSkills = data.competences.filter((skill) => skill.id_competencea >= 0);

      const createdSkills = [];
      for (const skill of newSkills) {
        const response = await employeeService.createSkill({
          code_competencea: skill.code_competencea,
          competencea: skill.competencea,
        });
        createdSkills.push({
          id_competencea: response.data.id_competencea,
          niveaua: skill.niveaua,
        });
      }

      const allSkills = [
        ...existingSkills.map((skill) => ({
          id_competencea: skill.id_competencea,
          niveaua: skill.niveaua,
        })),
        ...createdSkills,
      ];

      const finalData = {
        ...data,
        competences: allSkills,
      };

      return employeeService.update(id, finalData);
    },
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(["employee", id], response);
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["skills"]);
    },
    onError: (error) => {
      console.error("Error updating employee:", error);
    },
  });
};

// Hook pour supprimer un employé
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation((id) => employeeService.delete(id), {
    onSuccess: () => {
      // Invalider et refetch la liste des employés
      queryClient.invalidateQueries(["employees"])
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression de l'employé:", error)
    },
  })
}

export const useArchiveEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation((id) => employeeService.archive(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"])
    },
    onError: (error) => {
      console.error("Erreur lors de l'archivage de l'employé:", error)
    },
  })
}

export const useUnarchiveEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation((id) => employeeService.unarchive(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"])
    },
    onError: (error) => {
      console.error("Erreur lors du désarchivage de l'employé:", error)
    },
  })
}