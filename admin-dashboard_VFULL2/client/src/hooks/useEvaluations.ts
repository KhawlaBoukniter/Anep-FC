import { useQuery, useMutation, useQueryClient } from "react-query"
import { indisponibiliteService } from "../services/api"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

// Hook pour récupérer toutes les évaluations
export const useEvaluations = (filters = {}) => {
  return useQuery(["evaluations", filters], () => indisponibiliteService.getAll(filters), {
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // Cache de 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache de 10 minutes
  })
}

// Hook pour récupérer une évaluation par ID
export const useEvaluation = (id: string) => {
  return useQuery(["evaluation", id], () => indisponibiliteService.getById(id), {
    select: (response) => response.data,
    enabled: !!id,
  })
}

// Hook pour récupérer les évaluations par registration_id
export const useEvaluationsByRegistration = (registrationId: string) => {
  return useQuery(
    ["evaluations", registrationId],
    () => indisponibiliteService.getByRegistrationId(registrationId),
    {
      select: (response) => response.data,
      enabled: !!registrationId,
    }
  )
}

// Hook pour créer une évaluation
export const useCreateEvaluation = () => {
  const queryClient = useQueryClient()
  return useMutation(
    (data: {
      registration_id: number
      module_id: string
      apports: number
      reponse: number
      condition: number
      conception: number
      qualite: number
    }) => indisponibiliteService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["evaluations"])
      },
      onError: (error) => {
        console.error("Erreur lors de la création de l'évaluation:", error)
      },
    }
  )
}