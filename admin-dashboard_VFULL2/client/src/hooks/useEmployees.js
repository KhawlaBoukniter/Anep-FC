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
export const useCreateEmployee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    /**
     * @param {{ [key: string]: any }} data
     */
    mutationFn: (data) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"])
    },
    onError: (error) => {
      console.error("Erreur lors de la création de l'employé:", error)
    },
  })
}

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
    mutationFn: ({ id, data }) => employeeService.update(id, data),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData(["employee", id], response);
      queryClient.invalidateQueries(["employees"]);
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
