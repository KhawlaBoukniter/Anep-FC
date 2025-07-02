"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { ChevronLeft, ChevronRight, Plus, Copy, X, Edit, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx";
import { useDropzone } from "react-dropzone";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useApiAxios from "../config/axios";
import { useToast } from "../hooks/use-toast.ts";
import { Checkbox } from "./ui/checkbox.tsx";
import debounce from "lodash/debounce";
import api from "../services/api.js";
import { useProfilesPG } from "../hooks/useProfilesPG.ts";

interface Course {
  _id: string;
  title: string;
  offline: "online" | "offline" | "hybrid"; 
  description: string;
  hidden: "visible" | "hidden";
  budget: number;
  location: string;
  imageUrl: string;
  notification: any[]; 
  times: {
    startTime: string;
    endTime: string;
    instructorType: "intern" | "extern";
    instructor: string;
    instructorName: string;
    externalInstructorDetails: {
      phone: string;
      position: string;
      cv: File | null;
    };
  }[];
  image: File | null;
  assignedUsers: Profile[] | string[];
  interestedUsers: Profile[] | string[];
}

interface Profile {
  id_profile: number;
  name: string; 
  "NOM PRENOM": string;
  ADRESSE: string | null;
  DATE_NAISS: string | null;
  DAT_REC: string | null;
  CIN: string | null;
  DETACHE: string | null;
  SEXE: string | null;
  SIT_F_AG: string | null;
  STATUT: string | null;
  DAT_POS: string | null;
  LIBELLE_GRADE: string | null;
  GRADE_ASSIMILE: string | null;
  LIBELLE_FONCTION: string | null;
  DAT_FCT: string | null;
  LIBELLE_LOC: string | null;
  LIBELLE_REGION: string | null;
  created_at: string;
  updated_at: string;
}

interface EditModuleModalProps {
  module: Course;
  onCourseUpdated?: () => void;
}

export function EditModuleModal({ module, onCourseUpdated }: EditModuleModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [openInstructorPopover, setOpenInstructorPopover] = useState({});
  const [searchUser, setSearchUser] = useState("");
  const [openUserPopover, setOpenUserPopover] = useState(false);
  const userInputRef = useRef<HTMLInputElement>(null);

  if (!module) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Aucun module sélectionné.",
    });
    return null;
  }

  const [course, setCourse] = useState<Partial<Course>>({
    _id: module._id,
    title: module.title,
    location: module.location,
    imageUrl: module.imageUrl,
    offline: module.offline,
    description: module.description,
    hidden: module.hidden,
    budget: module.budget,
    notification: module.notification,
    times: module.times,
    image: module.image,
    assignedUsers: module.assignedUsers,
    interestedUsers: module.interestedUsers,
  });

  const [users, setUsers] = useState<Profile[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<Profile[]>([]);
  const [interestedUsers, setInterestedUsers] = useState<Profile[]>([]);
  const [internalInstructors, setInternalInstructors] = useState<{ label: string; id: number }[]>([]);
  const [filter, setFilter] = useState({
    fonction: null as { label: string } | null,
    localite: null as { label: string } | null,
    gradeAssimile: null as { label: string } | null,
    region: null as { label: string } | null,
  });
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const baseUrl = "https://anep-proejct.onrender.com";

  const { data: profiles = [], isLoading, error } = useProfilesPG();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const allCoursesResponse = await useApiAxios.get("/courses");
        setAllCourses(allCoursesResponse.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les cours.",
        });
      }
    };
    fetchCourses();
  }, [toast]);

  useEffect(() => {
    if (profiles.length) {
      setUsers(profiles);
      setInternalInstructors(
        profiles.map((profile) => ({
          label: profile.name,
          id: profile.id_profile,
        }))
      );
      console.log(profiles)
      if (module.assignedUsers?.length || module.interestedUsers?.length) {
        const mapUsers = (userIds: string[] | Profile[]): Profile[] => {
          return (Array.isArray(userIds) ? userIds : []).map((id) => {
            if (typeof id === "string") {
              return profiles.find((p) => p.id_profile.toString() === id);
            }
            return id;
          }).filter((user): user is Profile => !!user);
        };
        setAssignedUsers(mapUsers(module.assignedUsers));
        setInterestedUsers(mapUsers(module.interestedUsers));
      }
    }
  }, [profiles, module]);

  // useEffect(() => {
  //   if (course.interestedUsers) {
  //     setInterestedUsers(course.interestedUsers);
  //   }
  // }, [course]);
  
  // useEffect(() => {
  //   if (profiles.length) {
  //     setUsers(profiles);
  //     setInternalInstructors(
  //       profiles.map((profile) => ({
  //         label: profile["NOM PRENOM"],
  //         id: profile.id_profile,
  //       }))
  //     );
  //   }
  // }, [profiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setCourse((prev) => ({
        ...prev,
        image: Object.assign(file, { preview: URL.createObjectURL(file) }),
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleInputChange = (field: keyof Course, value: any) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  const handleSessionChange = (index: number, field: string, value: any, isExternalDetail = false) => {
    const updatedTimes = [...course.times];
    if (field === "instructorType") {
      updatedTimes[index] = {
        ...updatedTimes[index],
        instructorType: value,
        instructor: "",
        instructorName: "",
        externalInstructorDetails: {
          phone: "",
          position: "",
          cv: null,
        },
      };
    } else if (field === "instructor") {
      updatedTimes[index].instructor = value?.id.toString() || "";
      updatedTimes[index].instructorName = value?.label || "";
    } else if (isExternalDetail) {
      updatedTimes[index].externalInstructorDetails[field] = value;
    } else {
      updatedTimes[index][field] = value;
    }
    setCourse((prev) => ({ ...prev, times: updatedTimes }));
  };

  const handleAddSession = () => {
    setCourse((prev) => ({
      ...prev,
      times: [
        ...prev.times,
        {
          startTime: "",
          endTime: "",
          instructorType: "intern",
          instructor: "",
          instructorName: "",
          externalInstructorDetails: { phone: "", position: "", cv: null },
        },
      ],
    }));
  };

  const handleDuplicateSession = (index: number) => {
    const session = course.times![index];
    setCourse((prev) => ({
      ...prev,
      times: [...(prev.times || []), { ...session }],
    }));
  };

  const handleRemoveSession = (index: number) => {
    setCourse((prev) => ({
      ...prev,
      times: (prev.times || []).filter((_, i) => i !== index),
    }));
  };

  const handleFilterChange = debounce((field: string, value: any) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
  }, 300);

  const uniqueOptions = (field: string) => {
    const uniqueSet = new Set();
    const options = [{ label: "All" }];

    profiles.forEach((profile) => {
      const rawValue =
        field === "fonction"
          ? profile["LIBELLE FONCTION"]
          : field === "localite"
          ? profile["LIBELLE LOC"]
          : field === "gradeAssimile"
          ? profile["GRADE ASSIMILE"]
          : field === "region"
          ? profile["LIBELLE REGION"]
          : null;

      if (rawValue && !uniqueSet.has(rawValue)) {
        uniqueSet.add(rawValue);
        options.push({ label: rawValue });
      }
    });

    return options;
  };


  const filteredUsers = users.filter(
    (user) =>
      (!filter.fonction || filter.fonction.label === "All" || user["LIBELLE FONCTION"] === filter.fonction?.label) &&
      (!filter.localite || filter.localite.label === "All" || user["LIBELLE LOC"] === filter.localite?.label) &&
      (!filter.gradeAssimile || filter.gradeAssimile.label === "All" || user["GRADE ASSIMILE"] === filter.gradeAssimile?.label) &&
      (!filter.region || filter.region.label === "All" || user["LIBELLE REGION"] === filter.region?.label) &&
      !assignedUsers.some((assignedUser) => assignedUser.id_profile === user.id_profile)
  );

  const checkConflicts = (userId: string, startTime: string, endTime: string) => {
    const user = users.find((user) => user.id_profile.toString() === userId);
    if (!user) return null;

    for (const course of allCourses) {
      if (course._id !== module._id) {
        const assignedUserIds = Array.isArray(course.assignedUsers)
          ? course.assignedUsers.map((u) => (typeof u === "string" ? u : u.id_profile.toString()))
          : [];
        if (assignedUserIds.includes(userId)) {
          for (const time of course.times) {
            if (
              (new Date(startTime) >= new Date(time.startTime) &&
                new Date(startTime) <= new Date(time.endTime)) ||
              (new Date(endTime) >= new Date(time.startTime) &&
                new Date(endTime) <= new Date(time.endTime))
            ) {
              return { type: "course", course };
            }
          }
        }
      }
    }
    return null;
  };

  const handleAssignUser = (userId: string) => {
    const userToAssign = interestedUsers.find((user) => user.id_profile.toString() === userId);
    if (userToAssign) {
      setAssignedUsers((prev) => [...prev, userToAssign].filter((user): user is Profile => !!user));
    }
  };

  const filteredInterestedUsers = interestedUsers.filter(
    (interestedUser) =>
      !assignedUsers.some((assignedUser) => assignedUser.id_profile === interestedUser.id_profile)
  );

  const handleUserToggle = (user: Profile) => {
    setAssignedUsers((prev) => {
      const exists = prev.some((u) => u.id_profile === user.id_profile);
      return exists
        ? prev.filter((u) => u.id_profile !== user.id_profile)
        : [...prev, user];
    });
    setSearchUser("");
    setOpenUserPopover(false);
    setTimeout(() => userInputRef.current?.focus(), 100);
  };

  const handleSubmit = async () => {
  if (
    !course.title ||
    !["online", "offline", "hybrid"].includes(course.offline || "") ||
    !["visible", "hidden"].includes(course.hidden || "") ||
    course.budget == null ||
    !course.location ||
    !course.times?.length
  ) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Veuillez remplir tous les champs obligatoires avec des valeurs valides.",
    });
    return;
  }
  for (const time of course.times || []) {
    if (!time.startTime || !time.endTime || !time.instructorName) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Tous les créneaux doivent avoir une heure de début, de fin et un instructeur.",
      });
      return;
    }
  }

  const courseData = {
    ...course,
    assignedUsers: assignedUsers.map((user) => user.id_profile.toString()), // Temporary placeholder
  };

  try {
    // Step 1: Map id_profile to User._id
    const profileIds = assignedUsers.map((user) => user.id_profile);
    console.log("Sending profileIds to map:", profileIds); // Debug log
    const userMappingResponse = await useApiAxios.post("/users/map-by-profile-ids", {
      profileIds,
    });
    console.log("User Mapping Response:", userMappingResponse.data); // Debug log
    const mappedUserIds = userMappingResponse.data.map((item: { userId: string }) => item.userId);

    if (mappedUserIds.length !== profileIds.length) {
      console.warn("Mismatch detected:", {
        sent: profileIds.length,
        received: mappedUserIds.length,
        missing: profileIds.filter((id) => !mappedUserIds.includes(id.toString())),
      });
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Certains profils n'ont pas d'utilisateurs correspondants. Veuillez synchroniser les données ou contacter l'administrateur.",
      });
      return;
    }

    courseData.assignedUsers = mappedUserIds; // Update with valid ObjectId strings

    if (course.image) {
      const formData = new FormData();
      formData.append("image", course.image);
      course.times.forEach((session, index) => {
        if (session.externalInstructorDetails?.cv) {
          formData.append(`cv_${index}`, session.externalInstructorDetails.cv);
        }
      });

      const imageUploadResponse = await useApiAxios.post("/courses/uploadImage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (imageUploadResponse.status === 200) {
        courseData.imageUrl = imageUploadResponse.data.imageUrl;
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Échec du téléchargement de l'image: ${imageUploadResponse.status}`,
        });
        return;
      }
    }

    for (const user of assignedUsers) {
      const conflictCourse = checkConflicts(user.id_profile.toString(), course.times[0].startTime, course.times[0].endTime);
      if (conflictCourse) {
        await useApiAxios.put(`/courses/${conflictCourse.course._id}`, {
          ...conflictCourse.course,
          assignedUsers: (conflictCourse.course.assignedUsers as any[])
            .map((u) => (typeof u === "string" ? u : u.id_profile.toString()))
            .filter((u) => u !== user.id_profile.toString()),
        });
      }
    }

    console.log("Sending courseData to update:", courseData); // Debug log
    await useApiAxios.put(`/courses/${module._id}`, courseData);
    toast({ title: "Succès", description: "Cours mis à jour avec succès." });
    setCurrentStep(1);
    setOpen(false);

    if (onCourseUpdated) {
      onCourseUpdated();
    }
      
  } catch (error) {
    console.error("Failed to update course", error.response?.data || error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: error.response?.data?.message || "Échec de la mise à jour du cours.",
    });
  }
};

  const handleClose = () => {
    setCourse({
      title: "",
      location: "",
      imageUrl: "",
      offline: "",
      description: "",
      hidden: "",
      budget: "",
      notification: [],
      times: [
        {
          startTime: "",
          endTime: "",
          instructorType: "intern",
          instructor: "",
          instructorName: "",
          externalInstructorDetails: { phone: "", position: "", cv: null },
        },
      ],
      image: null,
      assignedUsers: [],
      interestedUsers: [],
    });
    setAssignedUsers([]);
    setInterestedUsers([]);
    setFilter({
      fonction: null,
      localite: null,
      gradeAssimile: null,
      region: null,
    });
    setCurrentStep(1);
    setOpen(false);
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
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
            <DialogTitle className="text-xl">Modifier le Cours</DialogTitle>
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
              <span className="text-sm text-gray-600">Infos de Base</span>
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
              <span className="text-sm text-gray-600">Planification</span>
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
              <span className="text-sm text-gray-600">Utilisateurs</span>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Entrez le titre du cours"
                  value={course.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  placeholder="Entrez le lieu"
                  value={course.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed p-4 text-center ${
                    isDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  <p className="text-gray-600">
                    {isDragActive
                      ? "Déposez l'image ici..."
                      : "Glissez-déposez une image ici, ou cliquez pour sélectionner"}
                  </p>
                </div>
                {course.image ? (
                  <img
                    src={course.image.preview}
                    alt="Aperçu"
                    className="mt-4 w-full h-auto rounded"
                  />
                ) : course.imageUrl ? (
                  <img
                    src={`${baseUrl}${course.imageUrl}`}
                    alt="Cours"
                    className="mt-4 w-full h-auto rounded"
                  />
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="offline">En ligne/Présentiel</Label>
                <Select
                  value={course.offline || ""}
                  onValueChange={(value) => handleInputChange("offline", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">En ligne</SelectItem>
                    <SelectItem value="offline">Présentiel</SelectItem>
                    <SelectItem value="hybrid">Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <ReactQuill
                  theme="snow"
                  value={course.description || ""}
                  onChange={(content) => handleInputChange("description", content)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hidden">Visibilité</Label>
                <Select
                  value={course.hidden || ""}
                  onValueChange={(value) => handleInputChange("hidden", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la visibilité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visible">Visible</SelectItem>
                    <SelectItem value="hidden">Caché</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Entrez le budget"
                  value={course.budget ?? ""}
                  onChange={(e) => handleInputChange("budget", Number(e.target.value))}
                  required
                />
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Planification</h3>
              {(course.times || []).map((session, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`startTime-${index}`}>Heure de début</Label>
                      <Input
                        id={`startTime-${index}`}
                        type="datetime-local"
                        value={session.startTime}
                        onChange={(e) => handleSessionChange(index, "startTime", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`endTime-${index}`}>Heure de fin</Label>
                      <Input
                        id={`endTime-${index}`}
                        type="datetime-local"
                        value={session.endTime}
                        onChange={(e) => handleSessionChange(index, "endTime", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`instructorType-${index}`}>Type d'instructeur</Label>
                    <Select
                      value={session.instructorType}
                      onValueChange={(value) => handleSessionChange(index, "instructorType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intern">Interne</SelectItem>
                        <SelectItem value="extern">Externe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {session.instructorType === "intern" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`instructor-${index}`}>Instructeur</Label>
                      <Popover
                        open={openInstructorPopover[index]}
                        onOpenChange={(open) =>
                          setOpenInstructorPopover((prev) => ({ ...prev, [index]: open }))
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            {session.instructorName || "Sélectionner un instructeur"}
                            <ChevronRight className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Rechercher un instructeur..." />
                            <CommandList>
                              <CommandEmpty>Aucun instructeur trouvé.</CommandEmpty>
                              <CommandGroup>
                                {internalInstructors.map((instructor) => (
                                  <CommandItem
                                    key={instructor.id}
                                    value={instructor.label}
                                    onSelect={() =>
                                      handleSessionChange(index, "instructor", instructor)
                                    }
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        session.instructor === instructor.id.toString()
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {instructor.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`instructorName-${index}`}>Nom de l'instructeur</Label>
                        <Input
                          id={`instructorName-${index}`}
                          placeholder="Entrez le nom"
                          value={session.instructorName}
                          onChange={(e) =>
                            handleSessionChange(index, "instructorName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${index}`}>Téléphone</Label>
                        <Input
                          id={`phone-${index}`}
                          placeholder="Entrez le numéro de téléphone"
                          value={session.externalInstructorDetails.phone}
                          onChange={(e) =>
                            handleSessionChange(index, "phone", e.target.value, true)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`position-${index}`}>Poste</Label>
                        <Input
                          id={`position-${index}`}
                          placeholder="Entrez le poste"
                          value={session.externalInstructorDetails.position}
                          onChange={(e) =>
                            handleSessionChange(index, "position", e.target.value, true)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`cv-${index}`}>CV</Label>
                        <Input
                          id={`cv-${index}`}
                          type="file"
                          onChange={(e) =>
                            handleSessionChange(index, "cv", e.target.files?.[0], true)
                          }
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSession(index)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicateSession(index)}
                    >
                      <Copy className="h-4 w-4 text-blue-500" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={handleAddSession}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une session
              </Button>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              {isLoading && <p>Chargement des profils...</p>}
              {error && (
                <p className="text-red-500">
                  Erreur lors du chargement des profils : {(error as Error).message}
                </p>
              )}
              <h3 className="text-lg font-semibold text-gray-900">Assigner des Utilisateurs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Fonction", field: "fonction" },
                  { label: "Localité", field: "localite" },
                  { label: "Grade Assimilé", field: "gradeAssimile" },
                  { label: "Région", field: "region" },
                ].map(({ label, field }) => (
                  <div key={field} className="space-y-2 overflow-hidden">
                    <Label htmlFor={field} className="text-sm font-medium text-gray-700">
                      {label}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-md text-sm text-gray-600 hover:text-gray-800"
                        >
                          {filter[field]?.label || `Sélectionner ${label.toLowerCase()}`}
                          <ChevronRight className="ml-2 h-4 w-4 opacity-70" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0 bg-white shadow-lg rounded-md">
                        <Command>
                          <CommandInput placeholder="Rechercher..." className="text-sm" />
                          <CommandList>
                            <CommandEmpty>Aucune option trouvée.</CommandEmpty>
                            <CommandGroup>
                              {uniqueOptions(field).map((option) => (
                                <CommandItem
                                  key={option.label}
                                  value={option.label}
                                  onSelect={() => handleFilterChange(field, option)}
                                  className="text-sm hover:bg-gray-100"
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      filter[field]?.label === option.label ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {option.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <Label htmlFor="users" className="text-lg font-semibold text-gray-900">
                  Assigner des Utilisateurs
                </Label>
                <Popover open={openUserPopover} onOpenChange={setOpenUserPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-md text-sm text-gray-600 hover:text-gray-800"
                      onClick={() => setOpenUserPopover(true)}
                    >
                      {assignedUsers.length
                        ? `${assignedUsers.length} utilisateur(s) assigné(s)`
                        : "Sélectionner des utilisateurs"}
                      <ChevronRight className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 bg-white shadow-lg rounded-md">
                    <Command>
                      <CommandInput
                        ref={userInputRef}
                        placeholder="Rechercher un utilisateur..."
                        value={searchUser}
                        onValueChange={setSearchUser}
                        className="text-sm"
                      />
                      <CommandList>
                        <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                        <CommandGroup>
                          {filteredUsers.map((user) => {
                            const conflict = checkConflicts(
                              user.id_profile.toString(),
                              course.times?.[0]?.startTime || "",
                              course.times?.[0]?.endTime || ""
                            );
                            return (
                              <CommandItem
                                key={user.id_profile}
                                value={user.name}
                                onSelect={() => handleUserToggle(user)}
                                className={`text-sm ${conflict ? (conflict.type === "course" ? "text-red-500" : "text-yellow-500") : ""}`}
                              >
                                <Checkbox
                                  checked={assignedUsers.some((u) => u.id_profile === user.id_profile)}
                                  className="mr-2 h-4 w-4"
                                />
                                <span>{user.name}</span>
                                {conflict && conflict.type === "course" && (
                                  <span className="ml-2 text-red-500 text-xs">
                                    (Conflit avec : {conflict.course.title})
                                  </span>
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {assignedUsers.map((user) => (
                    <div
                      key={user.id_profile}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {user.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 text-blue-600 hover:text-blue-800"
                        onClick={() => handleUserToggle(user)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Utilisateurs Intéressés</h3>
              <div className="space-y-2">
                {filteredInterestedUsers.map((user) => (
                  <div
                    key={user.id_profile}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{user.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignUser(user.id_profile.toString())}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm"
                    >
                      Assigner
                    </Button>
                  </div>
                ))}
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
              >
                Sauvegarder le cours
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}