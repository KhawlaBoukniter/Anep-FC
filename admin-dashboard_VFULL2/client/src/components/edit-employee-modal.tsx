"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Button } from "./ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { ChevronLeft, ChevronRight, Edit, UserPlus, X, Check, ChevronDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx";
import { useUpdateEmployee } from "../hooks/useEmployees";
import { useJobs } from "../hooks/useJobs";
import { useSkills } from "../hooks/useSkills";
import { Employee, Competence, Emploi, Profile } from "../types/employee";
import { useToast } from "../hooks/use-toast.ts";
import api from "../services/api.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface EditEmployeeModalProps {
  employee: Employee;
}

export function EditEmployeeModal({ employee }: EditEmployeeModalProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [skillSectionsOpen, setSkillSectionsOpen] = useState({
    required: true,
    additional: true,
    complementary: true,
  });

  const [profileData, setProfileData] = useState<Partial<Profile>>({
    "NOM PRENOM": employee.nom_complet || "",
    ADRESSE: employee.profile?.ADRESSE || null,
    DATE_NAISS: employee.profile?.DATE_NAISS || null,
    DAT_REC: employee.profile?.DAT_REC || null,
    CIN: employee.cin || null,
    DETACHE: employee.profile?.DETACHE || null,
    SEXE: employee.profile?.SEXE || null,
    SIT_F_AG: employee.profile?.SIT_F_AG || null,
    STATUT: employee.profile?.STATUT || null,
    DAT_POS: employee.profile?.DAT_POS || null,
    LIBELLE_GRADE: employee.profile?.LIBELLE_GRADE || null,
    GRADE_ASSIMILE: employee.profile?.GRADE_ASSIMILE || null,
    LIBELLE_FONCTION: employee.profile?.LIBELLE_FONCTION || null,
    DAT_FCT: employee.profile?.DAT_FCT || null,
    LIBELLE_LOC: employee.profile?.LIBELLE_LOC || null,
    LIBELLE_REGION: employee.profile?.LIBELLE_REGION || null,
  });

  const [formData, setFormData] = useState<Partial<Employee>>({
    id_employe: employee.id_employe,
    nom_complet: employee.nom_complet || "",
    email: employee.email || null,
    telephone1: employee.telephone1 || null,
    telephone2: employee.telephone2 || null,
    categorie: employee.categorie || null,
    specialite: employee.specialite || null,
    experience_employe: employee.experience_employe || 0,
    role: employee.role || "user",
    cin: employee.cin || null,
    emplois: employee.emplois || [],
    competences: employee.competences || [],
  });

  const [requiredSkills, setRequiredSkills] = useState<Competence[]>([]);
  const [additionalJobSkills, setAdditionalJobSkills] = useState<Competence[]>([]);
  const [complementarySkills, setComplementarySkills] = useState<Competence[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [openSkillPopover, setOpenSkillPopover] = useState(false);
  const [openJobPopover, setOpenJobPopover] = useState(false);
  const [searchSkill, setSearchSkill] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const jobInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateEmployee, isPending } = useUpdateEmployee();
  const { data: jobs = [] } = useJobs();
  const { data: availableCompetences = [] } = useSkills();
  const { toast } = useToast();

  useEffect(() => {
    const initializeRequiredSkills = async () => {
      if (formData.emplois && formData.emplois.length > 0) {
        try {
          const jobIds = formData.emplois.map((job) => job.id_emploi);
          const response = await api.get("/api/req-skills/required", { params: { jobIds: jobIds.join(",") } });
          const newRequiredSkills = response.data.map((skill) => ({
            id_competencea: Number(skill.id_competencer),
            code_competencea: skill.code_competencer,
            competencea: skill.competencer,
            niveaua: 0,
          }));

          // Toutes les compétences existantes de l'employé
          const allExistingSkills = [...employee.competences].map((skill) => ({
            ...skill,
            id_competencea: Number(skill.id_competencea),
          }));

          // Identifier les compétences requises actuelles (uniquement celles de l'emploi actuel)
          const currentRequiredSkillIds = new Set(newRequiredSkills.map((s) => Number(s.id_competencea)));
          const mergedRequiredSkills = [
            ...allExistingSkills.filter((skill) =>
              currentRequiredSkillIds.has(Number(skill.id_competencea))
            ),
            ...newRequiredSkills.filter(
              (newSkill) =>
                !allExistingSkills.some((s) => Number(s.id_competencea) === Number(newSkill.id_competencea))
            ),
          ].map((skill) => ({
            ...skill,
            niveaua: allExistingSkills.find((s) => Number(s.id_competencea) === Number(skill.id_competencea))?.niveaua || skill.niveaua,
          }));

          // Déplacer toutes les compétences existantes non requises vers additionalJobSkills
          const nonRequiredSkills = allExistingSkills.filter(
            (skill) => !currentRequiredSkillIds.has(Number(skill.id_competencea))
          );

          // Mettre à jour les états en évitant les doublons
          setRequiredSkills(mergedRequiredSkills);
          setAdditionalJobSkills((prev) => {
            const existingAdditionalIds = new Set(prev.map((s) => Number(s.id_competencea)));
            return [
              ...prev.filter((s) => !nonRequiredSkills.some((ns) => Number(ns.id_competencea) === Number(s.id_competencea))),
              ...nonRequiredSkills,
            ].filter((skill) => !currentRequiredSkillIds.has(Number(skill.id_competencea)));
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des compétences requises:", error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de récupérer les compétences requises.",
          });
        }
      } else {
        setRequiredSkills([]);
        setAdditionalJobSkills(
          employee.competences.map((skill) => ({
            ...skill,
            id_competencea: Number(skill.id_competencea),
          }))
        );
      }
    };
    initializeRequiredSkills();
  }, [formData.emplois, employee.competences, toast]);


  useEffect(() => {
    setFormData((prev) => ({ ...prev, nom_complet: profileData["NOM PRENOM"] || "" }));
  }, [profileData["NOM PRENOM"]]);


  const emailExists = async (email: string) => {
    try {
      const response = await api.get(`/employees/check-email`, {
        params: { email },
      });
      return response.data.exists;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email :", error);
      return false;
    }
  };

  // const validateForm = async () => {
  //   if (!profileData["NOM PRENOM"]?.trim() || profileData["NOM PRENOM"].length <= 2) {
  //     toast({ variant: "destructive", title: "Erreur", description: "Le nom complet doit contenir au moins trois caractères." });
  //     return false;
  //   }
  //   if (!profileData.DATE_NAISS) {
  //     toast({ variant: "destructive", title: "Erreur", description: "La date de naissance est requise." });
  //     return false;
  //   }
  //   const naissance = new Date(profileData.DATE_NAISS);
  //   const now = new Date();
  //   const age = now.getFullYear() - naissance.getFullYear();
  //   const moisDiff = now.getMonth() - naissance.getMonth();
  //   const jourDiff = now.getDate() - naissance.getDate();
  //   const ageExact = (moisDiff < 0 || (moisDiff === 0 && jourDiff < 0)) ? age - 1 : age;
  //   if (isNaN(naissance.getTime()) || naissance > now) {
  //     toast({ variant: "destructive", title: "Erreur", description: "La date de naissance ne peut pas être dans le futur." });
  //     return false;
  //   }
  //   if (ageExact < 18) {
  //     toast({ variant: "destructive", title: "Erreur", description: "L’employé doit avoir au moins 18 ans." });
  //     return false;
  //   }
  //   if (!profileData.CIN?.trim() || !/^[A-Z]{1,2}[0-9]{5,6}$/.test(profileData.CIN)) {
  //     toast({ variant: "destructive", title: "Erreur", description: "Le CIN doit suivre le format valide (1-2 lettres suivies de 6-8 chiffres)." });
  //     return false;
  //   }
  //   if (!profileData.SEXE) {
  //     toast({ variant: "destructive", title: "Erreur", description: "Le sexe est requis." });
  //     return false;
  //   }
  //   if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  //     toast({ variant: "destructive", title: "Erreur", description: "Un email valide est requis." });
  //     return false;
  //   }
  //   if (formData.email !== employee.email) {
  //     const exists = await emailExists(formData.email);
  //     if (exists) {
  //       toast({ variant: "destructive", title: "Erreur", description: "Cet email est déjà utilisé." });
  //       return false;
  //     }
  //   }
  //   if (!formData.telephone1?.trim() || !/^\+?\d{10,15}$/.test(formData.telephone1)) {
  //     toast({ variant: "destructive", title: "Erreur", description: "Un numéro de téléphone principal valide est requis (10-15 chiffres)." });
  //     return false;
  //   }
  //   if (formData.telephone2 && !/^\+?\d{10,15}$/.test(formData.telephone2)) {
  //     toast({ variant: "destructive", title: "Erreur", description: "Le numéro de téléphone secondaire doit être valide (10-15 chiffres)." });
  //     return false;
  //   }
  //   if (!formData.categorie?.trim()) {
  //     toast({ variant: "destructive", title: "Erreur", description: "La catégorie est requise." });
  //     return false;
  //   }
  //   if (!formData.role) {
  //     toast({ variant: "destructive", title: "Erreur", description: "Le rôle est requis." });
  //     return false;
  //   }
  //   if (!profileData.DAT_REC) {
  //     toast({ variant: "destructive", title: "Erreur", description: "La date de recrutement est requise." });
  //     return false;
  //   }
  //   const dateRecrutement = new Date(profileData.DAT_REC);
  //   if (isNaN(dateRecrutement.getTime()) || dateRecrutement > now) {
  //     toast({ variant: "destructive", title: "Erreur", description: "La date de recrutement ne peut pas être dans le futur." });
  //     return false;
  //   }
  //   if (formData.emplois.length === 0) {
  //     toast({ variant: "destructive", title: "Erreur", description: "Au moins un emploi doit être sélectionné." });
  //     return false;
  //   }
  //   if (formData.experience_employe && formData.experience_employe < 0) {
  //     toast({ variant: "destructive", title: "Erreur", description: "L'expérience ne peut pas être négative." });
  //     return false;
  //   }
  //   return true;
  // };

  const handleProfileInputChange = (field: keyof Profile, value: string | number | null) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeInputChange = (field: keyof Employee, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleJobToggle = (job: Emploi) => {
    setFormData((prev) => {
      const exists = prev.emplois?.some((j) => j.id_emploi === job.id_emploi);
      const updatedJobs = exists
        ? prev.emplois?.filter((j) => j.id_emploi !== job.id_emploi) || []
        : [...(prev.emplois || []), job];
      return { ...prev, emplois: updatedJobs };
    });
    setOpenJobPopover(false);
    setTimeout(() => {
      jobInputRef.current?.focus();
    }, 100);
  };

  const handleSkillLevelChange = (id_competencea: number, niveaua: number, skillType: 'required' | 'additional' | 'complementary') => {
    const updateSkills = (skills: Competence[]) =>
      skills.map((skill) => (skill.id_competencea === id_competencea ? { ...skill, niveaua } : skill));

    if (skillType === 'required') {
      setRequiredSkills(updateSkills);
    } else if (skillType === 'additional') {
      setAdditionalJobSkills(updateSkills);
    } else {
      setComplementarySkills(updateSkills);
    }
  };

  const addAdditionalJobSkill = (id_competencea: number) => {
    const skill = availableCompetences.find((s: Competence) => s.id_competencea === id_competencea);
    const isAlreadyListed = [...requiredSkills, ...additionalJobSkills, ...complementarySkills].some(
      (s) => s.id_competencea === id_competencea
    );
    if (!skill || isAlreadyListed) return;
    const newSkillItem: Competence = {
      id_competencea,
      code_competencea: skill.code_competencea,
      competencea: skill.competencea,
      niveaua: 0,
    };
    setAdditionalJobSkills((prev) => [...prev, newSkillItem]);
    setSearchSkill("");
    setOpenSkillPopover(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const addComplementarySkill = async (skillName: string) => {
    if (!skillName.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom de la compétence est requis." });
      return;
    }

    const isAlreadyListed = [...requiredSkills, ...additionalJobSkills, ...complementarySkills].some(
      (s) => s.competencea.toLowerCase() === skillName.toLowerCase()
    );
    if (isAlreadyListed) {
      toast({ variant: "destructive", title: "Erreur", description: "Cette compétence est déjà listée." });
      return;
    }

    try {
      const newSkill = {
        code_competencea: `COMP_${skillName.slice(0, 3).toUpperCase()}_${Date.now()}`,
        competencea: skillName,
      };
      const response = await api.post("/skills", newSkill);
      const createdSkill = response.data;
      const skillToAdd: Competence = {
        id_competencea: createdSkill.id_competencea,
        code_competencea: newSkill.code_competencea,
        competencea: skillName,
        niveaua: 0,
      };
      setComplementarySkills((prev) => [...prev, skillToAdd]);
      setNewSkillName("");
      setSearchSkill("");
      setOpenSkillPopover(false);
      toast({ title: "Succès", description: "Compétence complémentaire ajoutée." });
    } catch (error) {
      console.error("Erreur lors de la création de la compétence:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la création de la compétence complémentaire.",
      });
    }
  };

  const removeSkill = (skillId: number, skillType: 'required' | 'additional' | 'complementary') => {
    if (skillType === 'required') {
      setRequiredSkills((prev) => prev.filter((skill) => skill.id_competencea !== skillId));
    } else if (skillType === 'additional') {
      setAdditionalJobSkills((prev) => prev.filter((skill) => skill.id_competencea !== skillId));
    } else {
      setComplementarySkills((prev) => prev.filter((skill) => skill.id_competencea !== skillId));
    }
  };

  const handleSubmit = async () => {
    // if (!(await validateForm())) return;

    const allCompetences = [
      ...requiredSkills,
      ...additionalJobSkills,
      ...complementarySkills,
    ].reduce((acc, skill) => {
      const existing = acc.find((s) => Number(s.id_competencea) === Number(skill.id_competencea));
      return existing
        ? acc.map((s) =>
          Number(s.id_competencea) === Number(skill.id_competencea) ? { ...s, niveaua: skill.niveaua } : s
        )
        : [...acc, { id_competencea: skill.id_competencea, niveaua: skill.niveaua }];
    }, [] as { id_competencea: number; niveaua: number }[]);

    const finalData = {
      id: formData.id_employe,
      profile_id: employee.profile?.id_profile,
      ...formData,
      cin: profileData.CIN || undefined,
      emplois: formData.emplois?.map((job) => ({ id_emploi: job.id_emploi })) || [],
      competences: allCompetences,
      profile: {
        "NOM PRENOM": profileData["NOM PRENOM"] || undefined,
        ADRESSE: profileData.ADRESSE || null,
        DATE_NAISS: profileData.DATE_NAISS || undefined,
        DAT_REC: profileData.DAT_REC || undefined,
        CIN: profileData.CIN || undefined,
        DETACHE: profileData.DETACHE || null,
        SEXE: profileData.SEXE || undefined,
        SIT_F_AG: profileData.SIT_F_AG || null,
        STATUT: profileData.STATUT || null,
        DAT_POS: profileData.DAT_POS || null,
        LIBELLE_GRADE: profileData.LIBELLE_GRADE || null,
        GRADE_ASSIMILE: profileData.GRADE_ASSIMILE || null,
        LIBELLE_FONCTION: profileData.LIBELLE_FONCTION || null,
        DAT_FCT: profileData.DAT_FCT || null,
        LIBELLE_LOC: profileData.LIBELLE_LOC || null,
        LIBELLE_REGION: profileData.LIBELLE_REGION || null,
      },
    };

    updateEmployee({ id: finalData.id, data: finalData }, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Employé mis à jour avec succès." });
        setCurrentStep(1);
        setOpen(false);
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.response?.data?.message || "Échec de la mise à jour de l'employé.",
        });
        console.error("Update error details:", error.response?.data);
      },
    });
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      id_employe: employee.id_employe,
      nom_complet: employee.nom_complet || "",
      email: employee.email || null,
      telephone1: employee.telephone1 || null,
      telephone2: employee.telephone2 || null,
      categorie: employee.categorie || null,
      specialite: employee.specialite || null,
      experience_employe: employee.experience_employe || 0,
      role: employee.role || "user",
      cin: employee.cin || null,
      emplois: employee.emplois || [],
      competences: employee.competences || [],
    });
    setProfileData({
      "NOM PRENOM": employee.nom_complet || "",
      ADRESSE: employee.profile?.ADRESSE || null,
      DATE_NAISS: employee.profile?.DATE_NAISS || null,
      DAT_REC: employee.profile?.DAT_REC || null,
      CIN: employee.cin || null,
      DETACHE: employee.profile?.DETACHE || null,
      SEXE: employee.profile?.SEXE || null,
      SIT_F_AG: employee.profile?.SIT_F_AG || null,
      STATUT: employee.profile?.STATUT || null,
      DAT_POS: employee.profile?.DAT_POS || null,
      LIBELLE_GRADE: employee.profile?.LIBELLE_GRADE || null,
      GRADE_ASSIMILE: employee.profile?.GRADE_ASSIMILE || null,
      LIBELLE_FONCTION: employee.profile?.LIBELLE_FONCTION || null,
      DAT_FCT: employee.profile?.DAT_FCT || null,
      LIBELLE_LOC: employee.profile?.LIBELLE_LOC || null,
      LIBELLE_REGION: employee.profile?.LIBELLE_REGION || null,
    });
    setRequiredSkills([]);
    setAdditionalJobSkills([]);
    setComplementarySkills([]);
    setNewSkillName("");
    setOpen(false);
  };

  const handleNextStep = async () => {
    // if (!(await validateForm())) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const toggleSkillSection = (section: 'required' | 'additional' | 'complementary') => {
    setSkillSectionsOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Edit className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-xl">Modifier l'Employé</DialogTitle>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="justify-items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
              >
                1
              </div>
              <span className="text-sm text-gray-600">Infos Personnelles</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className="justify-items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
              >
                2
              </div>
              <span className="text-sm text-gray-600">Infos Professionnelles</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className="justify-items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
              >
                3
              </div>
              <span className="text-sm text-gray-600">Compétences</span>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom_prenom">Nom complet</Label>
                <Input
                  id="nom_prenom"
                  placeholder="Entrez le nom complet"
                  value={profileData["NOM PRENOM"] || ""}
                  onChange={(e) => handleProfileInputChange("NOM PRENOM", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  placeholder="Entrez l'adresse"
                  value={profileData.ADRESSE || ""}
                  onChange={(e) => handleProfileInputChange("ADRESSE", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_naissance">Date de naissance</Label>
                <Input
                  id="date_naissance"
                  type="date"
                  value={
                    profileData.DATE_NAISS
                      ? new Date(profileData.DATE_NAISS).toISOString().split("T")[0]
                      : profileData.DATE_NAISS || ""
                  }
                  onChange={(e) => handleProfileInputChange("DATE_NAISS", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cin">CIN</Label>
                <Input
                  id="cin"
                  placeholder="Entrez le numéro CIN"
                  value={profileData.CIN || ""}
                  onChange={(e) => handleProfileInputChange("CIN", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe</Label>
                <Select
                  value={profileData.SEXE || employee.profile?.SEXE || ""}
                  onValueChange={(value) => handleProfileInputChange("SEXE", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le sexe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sit_f_ag">Situation familiale</Label>
                <Select
                  value={profileData.SIT_F_AG || employee.profile?.SIT_F_AG || ""}
                  onValueChange={(value) => handleProfileInputChange("SIT_F_AG", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la situation familiale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">Célibataire</SelectItem>
                    <SelectItem value="M">Marié(e)</SelectItem>
                    <SelectItem value="D">Divorcé(e)</SelectItem>
                    <SelectItem value="AUTRE">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="detache">Détaché</Label>
                <Select
                  value={profileData.DETACHE || employee.profile?.DETACHE || ""}
                  onValueChange={(value) => handleProfileInputChange("DETACHE", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'état de détachement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="O">Oui</SelectItem>
                    <SelectItem value="N">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select
                  value={profileData.STATUT || employee.profile?.STATUT || ""}
                  onValueChange={(value) => handleProfileInputChange("STATUT", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activite">Activité</SelectItem>
                    <SelectItem value="sortie de service">Sortie de service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dat_rec">Date de recrutement</Label>
                <Input
                  id="dat_rec"
                  type="date"
                  value={profileData.DAT_REC ? new Date(profileData.DAT_REC).toISOString().split("T")[0] : profileData.DAT_REC || ""}
                  onChange={(e) => handleProfileInputChange("DAT_REC", e.target.value)}
                />
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Entrez l'adresse email"
                  value={formData.email || ""}
                  onChange={(e) => handleEmployeeInputChange("email", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telephone1">Téléphone 1</Label>
                  <Input
                    id="telephone1"
                    type="tel"
                    placeholder="Entrez le numéro principal"
                    value={formData.telephone1 || ""}
                    onChange={(e) => handleEmployeeInputChange("telephone1", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone2">Téléphone 2</Label>
                  <Input
                    id="telephone2"
                    type="tel"
                    placeholder="Entrez le numéro secondaire"
                    value={formData.telephone2 || ""}
                    onChange={(e) => handleEmployeeInputChange("telephone2", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Input
                    id="categorie"
                    placeholder="Entrez la catégorie"
                    value={formData.categorie || ""}
                    onChange={(e) => handleEmployeeInputChange("categorie", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialite">Spécialité</Label>
                  <Input
                    id="specialite"
                    placeholder="Entrez la spécialité"
                    value={formData.specialite || ""}
                    onChange={(e) => handleEmployeeInputChange("specialite", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience_employe">Expérience (années)</Label>
                  <Input
                    id="experience_employe"
                    type="number"
                    placeholder="Entrez les années d'expérience"
                    value={formData.experience_employe || ""}
                    onChange={(e) => handleEmployeeInputChange("experience_employe", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select
                    value={formData.role || ""}
                    onValueChange={(value) => handleEmployeeInputChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dat_pos">Date de prise de poste</Label>
                  <div>
                    <DatePicker
                      selected={profileData.DAT_POS ? new Date(profileData.DAT_POS) : null}
                      onChange={(date) => handleProfileInputChange("DAT_POS", date ? date.toISOString().split('T')[0] : null)}
                      dateFormat="yyyy-MM-dd"
                      customInput={<Input id="dat_pos" className="w-72" />}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dat_fct">Date de fonction</Label>
                  <Input
                    id="dat_fct"
                    type="date"
                    value={employee.profile?.["DAT_FCT"] ? new Date(employee.profile?.["DAT_FCT"]).toISOString().split("T")[0] : profileData.DAT_FCT || ""}
                    onChange={(e) => handleProfileInputChange("DAT_FCT", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelle_grade">Libellé Grade</Label>
                <Input
                  id="libelle_grade"
                  placeholder="Entrez le libellé du grade"
                  value={employee.profile?.LIBELLE_GRADE || profileData.LIBELLE_GRADE || ""}
                  onChange={(e) => handleProfileInputChange("LIBELLE_GRADE", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade_assimile">Grade Assimilé</Label>
                <Input
                  id="grade_assimile"
                  placeholder="Entrez le grade assimilé"
                  value={employee.profile?.GRADE_ASSIMILE || profileData.GRADE_ASSIMILE || ""}
                  onChange={(e) => handleProfileInputChange("GRADE_ASSIMILE", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelle_fonction">Libellé Fonction</Label>
                <Input
                  id="libelle_fonction"
                  placeholder="Entrez le libellé de la fonction"
                  value={employee.profile?.LIBELLE_FONCTION || profileData.LIBELLE_FONCTION || ""}
                  onChange={(e) => handleProfileInputChange("LIBELLE_FONCTION", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="libelle_loc">Localisation</Label>
                <Input
                  id="libelle_loc"
                  placeholder="Entrez la localisation"
                  value={employee.profile?.LIBELLE_LOC || profileData.LIBELLE_LOC || ""}
                  onChange={(e) => handleProfileInputChange("LIBELLE_LOC", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="libelle_region">Région</Label>
                <Input
                  id="libelle_region"
                  placeholder="Entrez la région"
                  value={employee.profile?.LIBELLE_REGION || profileData.LIBELLE_REGION || ""}
                  onChange={(e) => handleProfileInputChange("LIBELLE_REGION", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emplois">Emplois</Label>
                <Popover open={openJobPopover} onOpenChange={setOpenJobPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      onClick={() => setOpenJobPopover(true)}
                    >
                      {formData.emplois?.length
                        ? `${formData.emplois.length} emploi(s) sélectionné(s)`
                        : "Sélectionner des emplois"}
                      <ChevronRight className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput ref={jobInputRef} placeholder="Rechercher un emploi..." />
                      <CommandList>
                        <CommandEmpty>Aucun emploi trouvé.</CommandEmpty>
                        <CommandGroup>
                          {jobs.map((job: Emploi) => (
                            <CommandItem
                              key={job.id_emploi}
                              value={job.nom_emploi}
                              onSelect={() => handleJobToggle(job)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${formData.emplois?.some((j) => j.id_emploi === job.id_emploi)
                                    ? "opacity-100"
                                    : "opacity-0"
                                  }`}
                              />
                              <div className="w-full">
                                <span className="font-bold">{job.codeemploi} :</span> {job.nom_emploi}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.emplois?.map((job) => (
                    <div
                      key={job.id_emploi}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {job.nom_emploi}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4"
                        onClick={() => handleJobToggle(job)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Compétences & Niveaux</h3>
                <p className="text-sm text-gray-600">
                  Modifiez les compétences acquises par l'employé parmi celles disponibles et indiquez le niveau de maîtrise
                  pour chacune (0 = non acquise, 4 = Expert).
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Command className="rounded-lg border">
                      <CommandInput
                        ref={inputRef}
                        placeholder="Rechercher une compétence ou en ajouter une nouvelle..."
                        value={searchSkill}
                        onValueChange={(value) => {
                          setSearchSkill(value);
                          setOpenSkillPopover(value.length > 0);
                        }}
                      />
                      {openSkillPopover && (
                        <CommandList className="absolute top-10 w-full border shadow-md bg-white z-10">
                          <CommandEmpty>
                            Aucune compétence trouvée.{" "}
                            <Button
                              variant="ghost"
                              onClick={() => {
                                addComplementarySkill(searchSkill);
                              }}
                            >
                              Ajouter "{searchSkill}" comme nouvelle compétence
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {availableCompetences
                              .filter((skill: Competence) =>
                                skill.competencea.toLowerCase().includes(searchSkill.toLowerCase())
                              )
                              .map((skill: Competence) => {
                                const isListed = [
                                  ...requiredSkills,
                                  ...additionalJobSkills,
                                  ...complementarySkills
                                ].some((s) => s.id_competencea === skill.id_competencea);
                                return (
                                  <CommandItem
                                    key={skill.id_competencea}
                                    disabled={isListed}
                                    className={isListed ? "text-gray-400 bg-gray-100 cursor-not-allowed" : ""}
                                    onSelect={() => !isListed && addAdditionalJobSkill(skill.id_competencea)}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${additionalJobSkills.some((s) => s.id_competencea === skill.id_competencea)
                                          ? "opacity-100"
                                          : "opacity-0"
                                        }`}
                                    />
                                    <span>{skill.competencea}</span>
                                  </CommandItem>
                                );
                              })}
                          </CommandGroup>
                        </CommandList>
                      )}
                    </Command>
                  </div>
                </div>
                {requiredSkills.length > 0 && (
                  <div className="space-y-3">
                    <h4
                      className="text-md font-semibold text-green-700 bg-green-100 p-2 rounded flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSkillSection('required')}
                    >
                      Compétences requises pour l'emploi
                      <span>{skillSectionsOpen.required ? <ChevronDown /> : <ChevronRight />}</span>
                    </h4>
                    {skillSectionsOpen.required && requiredSkills.map((skill) => (
                      <div
                        key={skill.id_competencea}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.competencea}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Select
                              value={skill.niveaua.toString()}
                              onValueChange={(value) => handleSkillLevelChange(skill.id_competencea, Number.parseInt(value), 'required')}
                            >
                              <SelectTrigger className="w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0</SelectItem>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {additionalJobSkills.length > 0 && (
                  <div className="space-y-3">
                    <h4
                      className="text-md font-semibold text-blue-700 bg-blue-100 p-2 rounded flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSkillSection('additional')}
                    >
                      Compétences hors emploi
                      <span>{skillSectionsOpen.additional ? <ChevronDown /> : <ChevronRight />}</span>
                    </h4>
                    {skillSectionsOpen.additional && additionalJobSkills.map((skill) => (
                      <div
                        key={skill.id_competencea}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.competencea}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Select
                              value={skill.niveaua.toString()}
                              onValueChange={(value) => handleSkillLevelChange(skill.id_competencea, Number.parseInt(value), 'additional')}
                            >
                              <SelectTrigger className="w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0</SelectItem>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSkill(skill.id_competencea, 'additional')}
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {complementarySkills.length > 0 && (
                  <div className="space-y-3">
                    <h4
                      className="text-md font-semibold text-purple-700 bg-purple-100 p-2 rounded flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSkillSection('complementary')}
                    >
                      Autres compétences
                      <span>{skillSectionsOpen.complementary ? <ChevronDown /> : <ChevronRight />}</span>
                    </h4>
                    {skillSectionsOpen.complementary && complementarySkills.map((skill) => (
                      <div
                        key={skill.id_competencea}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.competencea || "non défini"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Select
                              value={skill.niveaua.toString()}
                              onValueChange={(value) => handleSkillLevelChange(skill.id_competencea, Number.parseInt(value), 'complementary')}
                            >
                              <SelectTrigger className="w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0</SelectItem>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSkill(skill.id_competencea, 'complementary')}
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {(requiredSkills.length === 0 && additionalJobSkills.length === 0 && complementarySkills.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Aucune compétence sélectionnée. Utilisez le champ ci-dessus pour sélectionner des compétences.
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePreviousStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
              )}
            </div>
            {currentStep < 3 ? (
              <Button variant="outline" onClick={handleNextStep}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isPending}
              >
                {isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}