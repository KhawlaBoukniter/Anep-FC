"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Button } from "./ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { ChevronLeft, ChevronRight, UserPlus, X, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx";
import { useCreateEmployee } from "../hooks/useEmployees";
import { useJobs } from "../hooks/useJobs";
import { useSkills } from "../hooks/useSkills";
import { Employee, Competence, Emploi, Profile } from "../types/employee";
import { useToast } from "../hooks/use-toast.ts";
import axios from "axios";
import api from "../services/api.js";

export function AddEmployeeModal() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Employee>>({
    nom_complet: "",
    email: "",
    telephone1: "",
    telephone2: "",
    categorie: "",
    specialite: "",
    experience_employe: 0,
    role: "user",
    cin: "",
    emplois: [],
    competences: [],
  });
  const [profileData, setProfileData] = useState<Partial<Profile>>({
    "NOM PRENOM": "",
    ADRESSE: "",
    DATE_NAISS: "",
    DAT_REC: "",
    CIN: "",
    DETACHE: null, 
    SEXE: null, 
    SIT_F_AG: null, 
    STATUT: null, 
    DAT_POS: "",
    LIBELLE_GRADE: "",
    GRADE_ASSIMILE: "",
    LIBELLE_FONCTION: "",
    DAT_FCT: "",
    LIBELLE_LOC: "",
    LIBELLE_REGION: "",
  });

  const [competences, setCompetences] = useState<Competence[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Emploi[]>([]);
  const [openSkillPopover, setOpenSkillPopover] = useState(false);
  const [openJobPopover, setOpenJobPopover] = useState(false);
  const [searchSkill, setSearchSkill] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const jobInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createEmployee, isLoading } = useCreateEmployee();
  const { data: jobs = [] } = useJobs();
  const { data: availableCompetences = [] } = useSkills();
  const { toast } = useToast();

  const emailExists = async (email) => {
  try {
    console.log("Sending request to check email:", {
      url: `/employees/check-email`,
      params: { email },
    });
    const response = await api.get(`/employees/check-email`, {
      params: { email },
    });
    console.log("API response:", response.data);
    return response.data.exists;
  } catch (error) {
    console.error("Error during email verification:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
    });
    return false;
  }
};

  const validatePersonalInfo = async () => {
    if (!profileData["NOM PRENOM"]?.trim() || profileData["NOM PRENOM"].length <= 2) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom complet doit contenir au moins trois caractères." });
      return false;
    }
    if (!profileData.DATE_NAISS) {
      toast({ variant: "destructive", title: "Erreur", description: "La date de naissance est requise." });
      return false;
    }
    const naissance = new Date(profileData.DATE_NAISS);
    const now = new Date();
    const age = now.getFullYear() - naissance.getFullYear();
    const moisDiff = now.getMonth() - naissance.getMonth();
    const jourDiff = now.getDate() - naissance.getDate();
    const ageExact = (moisDiff < 0 || (moisDiff === 0 && jourDiff < 0)) ? age - 1 : age;
    if (isNaN(naissance.getTime()) || naissance > now) {
      toast({ variant: "destructive", title: "Erreur", description: "La date de naissance ne peut pas être dans le futur." });
      return false;
    }
    if (ageExact < 18) {
      toast({ variant: "destructive", title: "Erreur", description: "L’employé doit avoir au moins 18 ans." });
      return false;
    }
    if (!profileData.CIN?.trim() || !/^[A-Z]{1,2}[0-9]{5,6}$/.test(profileData.CIN)) {
      toast({ variant: "destructive", title: "Erreur", description: "Le CIN doit suivre le format valide (1-2 lettres suivies de 6-8 chiffres)." });
      return false;
    }
    
    if (!profileData.SEXE) {
      toast({ variant: "destructive", title: "Erreur", description: "Le sexe est requis." });
      return false;
    }
    return true;
  };

  const validateProfessionalInfo = async () => {
    console.log("Validating professional info:", { formData, selectedJobs });
    if (!formData.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ variant: "destructive", title: "Erreur", description: "Un email valide est requis." });
      return false;
    }
    const exists = await emailExists(formData.email);
    if (exists) {
      toast({ variant: "destructive", title: "Erreur", description: "Cet email est déjà utilisé." });
      return false;
    }
    if (!formData.telephone1?.trim() || !/^\+?\d{10,15}$/.test(formData.telephone1)) {
      toast({ variant: "destructive", title: "Erreur", description: "Un numéro de téléphone principal valide est requis (10-15 chiffres)." });
      return false;
    }
    if (formData.telephone2 && !/^\+?\d{10,15}$/.test(formData.telephone2)) {
      toast({ variant: "destructive", title: "Erreur", description: "Le numéro de téléphone secondaire doit être valide (10-15 chiffres)." });
      return false;
    }
    if (!formData.categorie?.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "La catégorie est requise." });
      return false;
    }
    if (!formData.role) {
      toast({ variant: "destructive", title: "Erreur", description: "Le rôle est requis." });
      return false;
    }
    if (!profileData.DAT_REC) {
      toast({ variant: "destructive", title: "Erreur", description: "La date de recrutement est requise." });
      return false;
    }
    const dateRecrutement = new Date(profileData.DAT_REC);
    const now = new Date();
    if (isNaN(dateRecrutement.getTime()) || dateRecrutement > now) {
      toast({ variant: "destructive", title: "Erreur", description: "La date de recrutement ne peut pas être dans le futur." });
      return false;
    }
    if (selectedJobs.length === 0) {
      toast({ variant: "destructive", title: "Erreur", description: "Au moins un emploi doit être sélectionné." });
      return false;
    }
    if (formData.experience_employe && formData.experience_employe < 0) {
      toast({ variant: "destructive", title: "Erreur", description: "L'expérience ne peut pas être négative." });
      return false;
    }
    return true;
  };

  const handleProfileInputChange = (field: keyof Profile, value: string | number | null) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeInputChange = (field: keyof Employee, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleJobToggle = (job: Emploi) => {
    setSelectedJobs((prev) => {
      const exists = prev.some((j) => j.id_emploi === job.id_emploi);
      if (exists) {
        return prev.filter((j) => j.id_emploi !== job.id_emploi);
      }
      return [...prev, job];
    });
    setOpenJobPopover(false);
    setTimeout(() => {
      jobInputRef.current?.focus();
    }, 100);
  };

  const handleSkillLevelChange = (id_competencea: number, niveaua: number) => {
    setCompetences((prev) => prev.map((skill) => (skill.id_competencea === id_competencea ? { ...skill, niveaua } : skill)));
  };

  const addSkill = (id_competencea: number) => {
    const skill = availableCompetences.find((s: Competence) => s.id_competencea === id_competencea);
    if (!skill || competences.some((s) => s.id_competencea === id_competencea)) return;
    const newSkillItem: Competence = {
      id_competencea,
      code_competencea: skill.code_competencea,
      competencea: skill.competencea,
      niveaua: 1,
    };
    setCompetences((prev) => [...prev, newSkillItem]);
    setSearchSkill("");
    setOpenSkillPopover(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const removeSkill = (skillId: number) => {
    setCompetences((prev) => prev.filter((skill) => skill.id_competencea !== skillId));
  };

  const handleSubmit = async () => {
    if (!(await validatePersonalInfo()) || !(await validateProfessionalInfo())) return;

    const finalData = {
      ...formData,
      cin: profileData.CIN || undefined,
      emplois: selectedJobs.map((job) => ({ id_emploi: job.id_emploi })),
      competences: competences.map(({ id_competencea, niveaua }) => ({
        id_competencea,
        niveaua,
      })),
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

    console.log("Final data to send:", finalData);

    createEmployee(finalData, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Employé créé avec succès." });
        setCurrentStep(1);
        setFormData({
          nom_complet: "",
          email: "",
          telephone1: "",
          telephone2: "",
          categorie: "",
          specialite: "",
          experience_employe: 0,
          role: "user",
          cin: "",
          emplois: [],
          competences: [],
        });
        setProfileData({
          "NOM PRENOM": "",
          ADRESSE: "",
          DATE_NAISS: "",
          DAT_REC: "",
          CIN: "",
          DETACHE: null,
          SEXE: null,
          SIT_F_AG: null,
          STATUT: null,
          DAT_POS: "",
          LIBELLE_GRADE: "",
          GRADE_ASSIMILE: "",
          LIBELLE_FONCTION: "",
          DAT_FCT: "",
          LIBELLE_LOC: "",
          LIBELLE_REGION: "",
        });
        setCompetences([]);
        setSelectedJobs([]);
        setOpen(false);
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.response?.data?.message || "Échec de la création de l'employé.",
        });
        console.error("Error details:", error.response?.data);
      },
    });
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      nom_complet: "",
      email: "",
      telephone1: "",
      telephone2: "",
      categorie: "",
      specialite: "",
      experience_employe: 0,
      role: "user",
      cin: "",
      emplois: [],
      competences: [],
    });
    setProfileData({
      "NOM PRENOM": "",
      ADRESSE: "",
      DATE_NAISS: "",
      DAT_REC: "",
      CIN: "",
      DETACHE: null,
      SEXE: null,
      SIT_F_AG: null,
      STATUT: null,
      DAT_POS: "",
      LIBELLE_GRADE: "",
      GRADE_ASSIMILE: "",
      LIBELLE_FONCTION: "",
      DAT_FCT: "",
      LIBELLE_LOC: "",
      LIBELLE_REGION: "",
    });
    setCompetences([]);
    setSelectedJobs([]);
    setOpen(false);
  };

  const handleNextStep = async () => {
    if (currentStep === 1 && !(await validatePersonalInfo())) return;
    if (currentStep === 2 && !(await validateProfessionalInfo())) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter Employé
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-xl">Formulaire Employé</DialogTitle>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="justify-items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="text-sm text-gray-600">Infos Personnelles</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className="justify-items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="text-sm text-gray-600">Infos Professionnelles</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className="justify-items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
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
                <Label htmlFor="nom_prenom">Nom complet *</Label>
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
                <Label htmlFor="date_naissance">Date de naissance *</Label>
                <Input
                  id="date_naissance"
                  type="date"
                  value={profileData.DATE_NAISS || ""}
                  onChange={(e) => handleProfileInputChange("DATE_NAISS", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cin">CIN *</Label>
                <Input
                  id="cin"
                  placeholder="Entrez le numéro CIN"
                  value={profileData.CIN || ""}
                  onChange={(e) => handleProfileInputChange("CIN", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexe">Sexe *</Label>
                <Select
                  value={profileData.SEXE || ""}
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
                  value={profileData.SIT_F_AG || ""}
                  onValueChange={(value) => handleProfileInputChange("SIT_F_AG", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la situation familiale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">Célibataire</SelectItem>
                    <SelectItem value="M">Marié(e)</SelectItem>
                    <SelectItem value="D">Divorcé(e)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
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
                  <Label htmlFor="telephone1">Téléphone 1 *</Label>
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
                  <Label htmlFor="categorie">Catégorie *</Label>
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
                  <Label htmlFor="role">Rôle *</Label>
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
              <div className="space-y-2">
                <Label htmlFor="dat_rec">Date de recrutement *</Label>
                <Input
                  id="dat_rec"
                  type="date"
                  value={profileData.DAT_REC || ""}
                  onChange={(e) => handleProfileInputChange("DAT_REC", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emplois">Emplois *</Label>
                <Popover open={openJobPopover} onOpenChange={setOpenJobPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      onClick={() => setOpenJobPopover(true)}
                    >
                      {selectedJobs.length > 0
                        ? `${selectedJobs.length} emploi(s) sélectionné(s)`
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
                                className={`mr-2 h-4 w-4 ${
                                  selectedJobs.some((j) => j.id_emploi === job.id_emploi)
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
                  {selectedJobs.map((job) => (
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
                  Sélectionnez les compétences acquises par l'employé parmi celles disponibles et indiquez le niveau de maîtrise
                  pour chacune (1 = Débutant, 4 = Expert).
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Command className="rounded-lg border">
                      <CommandInput
                        ref={inputRef}
                        placeholder="Rechercher une compétence..."
                        value={searchSkill}
                        onValueChange={(value) => {
                          setSearchSkill(value);
                          setOpenSkillPopover(value.length > 0);
                        }}
                      />
                      {openSkillPopover && (
                        <CommandList className="absolute top-10 w-full border shadow-md bg-white z-10">
                          <CommandEmpty>Aucune compétence trouvée.</CommandEmpty>
                          <CommandGroup>
                            {availableCompetences
                              .filter((skill: Competence) =>
                                skill.competencea.toLowerCase().includes(searchSkill.toLowerCase())
                              )
                              .map((skill: Competence) => (
                                <CommandItem
                                  key={skill.id_competencea}
                                  onSelect={() => addSkill(skill.id_competencea)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      competences.some((s) => s.id_competencea === skill.id_competencea)
                                      ? "opacity-100"
                                      : "opacity-0"
                                    }`}
                                  />
                                <span>{skill.competencea}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      )}
                    </Command>
                  </div>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {competences.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune compétence sélectionnée. Utilisez le champ ci-dessus pour sélectionner des compétences.
                    </div>
                  ) : (
                    competences.map((skill) => (
                      <div
                        key={skill.id_competencea}
                        className="flex items-center justify-between p-4 border-rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.competencea}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Niveau :</span>
                              <Select
                                value={skill.niveaua.toString()}
                                onValueChange={(value) => handleSkillLevelChange(skill.id_competencea, Number.parseInt(value))}
                              >
                                <SelectTrigger className="w-16">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
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
                              onClick={() => removeSkill(skill.id_competencea)}
                              className="h-8 w-8 text-gray-500 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
                disabled={isLoading}
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};