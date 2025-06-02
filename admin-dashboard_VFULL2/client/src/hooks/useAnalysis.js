import { useQuery } from "react-query"
import { analysisService } from "../services/api"

// Hook pour l'analyse des écarts de compétences
export const useSkillsGapAnalysis = (params, enabled = false) => {
  return useQuery(["skills-gap-analysis", params], () => analysisService.getSkillsGap(params), {
    select: (response) => response.data,
    enabled: enabled && !!params.skill_id && !!params.required_level,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook pour la distribution des compétences
export const useSkillsDistribution = () => {
  return useQuery(["skills-distribution"], () => analysisService.getSkillsDistribution(), {
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour les compétences par département
export const useDepartmentSkills = () => {
  return useQuery(["department-skills"], () => analysisService.getDepartmentSkills(), {
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook pour la correspondance emploi-employé
export const useJobMatching = (jobId, enabled = false) => {
  return useQuery(["job-matching", jobId], () => analysisService.getJobMatching(jobId), {
    select: (response) => response.data,
    enabled: enabled && !!jobId,
    staleTime: 2 * 60 * 1000,
  })
}
