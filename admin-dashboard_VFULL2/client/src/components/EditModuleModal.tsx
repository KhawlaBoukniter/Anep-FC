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
  // imageUrl: string;
  photos: string[];
  link: string;
  notification: any[];
  times: {
    dateRanges: { startTime: string; endTime: string }[];
    instructorType: "intern" | "extern";
    instructor: string;
    instructorName: string;
    externalInstructorDetails: {
      phone: string;
      position: string;
      cv: File | null | string;
    };
  }[];
  // image: File | null;
  support: {
    type: "link",
    value: ""
  };
  photosFiles: File[];
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

  const [course, setCourse] = useState<Partial<Course>>({
    _id: module._id,
    title: module.title,
    location: module.location,
    // imageUrl: module.imageUrl,
    photos: module.photos || [],
    link: module.link || "",
    offline: module.offline,
    description: module.description,
    hidden: module.hidden,
    budget: module.budget,
    notification: module.notification,
    times: module.times.map((time) => ({
      ...time,
      dateRanges: time.dateRanges || [{ startTime: time.startTime || "", endTime: time.endTime || "" }],
    })),
    // image: null,
    support: module.support || { type: "link", value: "" },
    photosFiles: [],
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
  const baseUrl = "../";

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
      if (module.assignedUsers?.length || module.interestedUsers?.length) {
        const mapUsers = (userIds: number[] | Profile[]): Profile[] => {
          const mappedUsers: Profile[] = [];
          const missingProfileIds: number[] = [];

          const profileIds = (Array.isArray(userIds) ? userIds : []).map((id) =>
            typeof id === 'number' ? id : Number(id.id_profile)
          );

          for (const profileId of profileIds) {
            const profile = profiles.find((p) => p.id_profile === profileId);
            if (profile) {
              mappedUsers.push(profile);
            } else {
              missingProfileIds.push(profileId);
              mappedUsers.push({
                id_profile: profileId,
                name: `Unknown User (${profileId})`,
                'NOM PRENOM': `Unknown User (${profileId})`,
                ADRESSE: null,
                DATE_NAISS: null,
                DAT_REC: null,
                CIN: null,
                DETACHE: null,
                SEXE: null,
                SIT_F_AG: null,
                STATUT: null,
                DAT_POS: null,
                LIBELLE_GRADE: null,
                GRADE_ASSIMILE: null,
                LIBELLE_FONCTION: null,
                DAT_FCT: null,
                LIBELLE_LOC: null,
                LIBELLE_REGION: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as Profile);
            }
          }

          if (missingProfileIds.length > 0) {
            toast({
              variant: 'destructive',
              title: 'Profils manquants',
              description: `Les profils suivants n'existent pas dans PostgreSQL: ${missingProfileIds.join(', ')}. Veuillez vérifier la base de données.`,
            });
          }

          // const mappedUsers = (Array.isArray(userIds) ? userIds : []).map((id) => {
          //   if (typeof id === "string") {
          //     const profile = profiles.find((p) => p.id_profile.toString() === id);
          //     if (!profile) {
          //       console.warn(`Profile not found for id_profile: ${id}`);
          //       return { id_profile: id, name: `Unknown User (${id})` } as Profile;
          //     }
          //     return profile;
          //     }
          //   return id;
          // }).filter((user): user is Profile => !!user);
          
          return mappedUsers;
        };
        // const assigned = mapUsers(module.assignedUsers);
        setAssignedUsers(mapUsers(module.assignedUsers));
        // if (assigned.length < (module.assignedUsers?.length || 0)) {
        //   console.warn(`Incomplete assignedUsers mapping. Expected: ${module.assignedUsers?.length}, Got: ${assigned.length}`);
        // }
        setInterestedUsers(mapUsers(module.interestedUsers));
      }
    }
  }, [profiles, module, toast]);

  // const onDropImage = useCallback((acceptedFiles: File[]) => {
  //   const file = acceptedFiles[0];
  //   if (file) {
  //     if (file.size > 5 * 1024 * 1024) {
  //       toast({
  //         variant: "destructive",
  //         title: "Erreur",
  //         description: "L'image ne doit pas dépasser 5 Mo.",
  //       });
  //       return;
  //     }
  //     if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
  //       toast({
  //         variant: "destructive",
  //         title: "Erreur",
  //         description: "Seuls les formats JPEG, PNG et GIF sont acceptés.",
  //       });
  //       return;
  //     }
  //     setCourse((prev) => ({
  //       ...prev,
  //       image: Object.assign(file, { preview: URL.createObjectURL(file) }),
  //     }));
  //   }
  // }, [toast]);

  // const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
  //   onDrop: onDropImage,
  //   multiple: false,
  //   accept: { 'image/jpeg': [], 'image/png': [], 'image/gif': [] },
  // });

  const onDropPhotos = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Chaque photo ne doit pas dépasser 5 Mo.",
        });
        return false;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Seuls les formats JPEG, PNG et GIF sont acceptés.",
        });
        return false;
      }
      return true;
    });

    setCourse((prev) => ({
      ...prev,
      photosFiles: [...(prev.photosFiles || []), ...validFiles.map((file) => Object.assign(file, { preview: URL.createObjectURL(file) }))],
    }));
  }, [toast]);

  const { getRootProps: getPhotosRootProps, getInputProps: getPhotosInputProps, isDragActive: isPhotosDragActive } = useDropzone({
    onDrop: onDropPhotos,
    multiple: true,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/gif': [] },
  });

    const onDropSupport = useCallback((acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Le fichier de support ne doit pas dépasser 5 Mo.",
          });
          return;
        }
        // Validate file type (e.g., PDF, Word, images)
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Seuls les formats PDF, Word, JPEG, PNG et GIF sont acceptés pour le support.",
          });
          return;
        }
        handleSupportChange("file", Object.assign(file, {
          preview: URL.createObjectURL(file),
        }));
      }
    }, [toast]);
  
    const { getRootProps: getSupportRootProps, getInputProps: getSupportInputProps, isDragActive: isSupportDragActive } = useDropzone({ onDrop: onDropSupport });

  const handleRemovePhoto = (index: number) => {
    setCourse((prev) => ({
      ...prev,
      photosFiles: (prev.photosFiles || []).filter((_, i) => i !== index),
    }));
  };

    const handleSupportChange = (type, value) => {
    setCourse((prev) => ({
        ...prev,
        support: {
            type,
            value
        }
    }));
  };

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
      if (field === "cv" && value) {
        if (value.size > 5 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Le CV ne doit pas dépasser 5 Mo.",
          });
          return;
        }
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(value.type)) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Seuls les formats PDF et Word sont acceptés pour le CV.",
          });
          return;
        }
      }
      updatedTimes[index].externalInstructorDetails[field] = value;
    } else {
      updatedTimes[index][field] = value;
    }
    setCourse((prev) => ({ ...prev, times: updatedTimes }));
  };

  const handleDateRangeChange = (sessionIndex: number, dateRangeIndex: number, field: string, value: string) => {
    const updatedTimes = [...course.times];
    updatedTimes[sessionIndex].dateRanges[dateRangeIndex][field] = value;
    setCourse((prev) => ({ ...prev, times: updatedTimes }));
  };

  const handleAddDateRange = (sessionIndex: number) => {
    const updatedTimes = [...course.times];
    updatedTimes[sessionIndex].dateRanges.push({ startTime: "", endTime: "" });
    setCourse((prev) => ({ ...prev, times: updatedTimes }));
  };

  const handleRemoveDateRange = (sessionIndex: number, dateRangeIndex: number) => {
    const updatedTimes = [...course.times];
    updatedTimes[sessionIndex].dateRanges = updatedTimes[sessionIndex].dateRanges.filter(
      (_, i) => i !== dateRangeIndex
    );
    if (updatedTimes[sessionIndex].dateRanges.length === 0) {
      updatedTimes[sessionIndex].dateRanges.push({ startTime: "", endTime: "" });
    }
    setCourse((prev) => ({ ...prev, times: updatedTimes }));
  };

  const handleAddSession = () => {
    setCourse((prev) => ({
      ...prev,
      times: [
        ...(prev.times || []),
        {
          dateRanges: [{ startTime: "", endTime: "" }],
          instructorType: "intern",
          instructor: "",
          instructorName: "",
          externalInstructorDetails: { phone: "", position: "", cv: null },
        },
      ],
    }));
  };

  const handleDuplicateSession = (index: number) => {
    const session = { ...course.times[index], dateRanges: [...course.times[index].dateRanges] };
    setCourse((prev) => ({
      ...prev,
      times: [...(prev.times || []), session],
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

    profiles.forEach((profile: Profile) => {
      const rawValue =
        field === "fonction"
          ? profile["LIBELLE_FONCTION"]
          : field === "localite"
          ? profile["LIBELLE_LOC"]
          : field === "gradeAssimile"
          ? profile["GRADE_ASSIMILE"]
          : field === "region"
          ? profile["LIBELLE_REGION"]
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
      (!filter.fonction || filter.fonction.label === "All" || user["LIBELLE_FONCTION"] === filter.fonction?.label) &&
      (!filter.localite || filter.localite.label === "All" || user["LIBELLE_LOC"] === filter.localite?.label) &&
      (!filter.gradeAssimile || filter.gradeAssimile.label === "All" || user["GRADE_ASSIMILE"] === filter.gradeAssimile?.label) &&
      (!filter.region || filter.region.label === "All" || user["LIBELLE_REGION"] === filter.region?.label) &&
      !assignedUsers.some((assignedUser) => assignedUser.id_profile === user.id_profile)
  );

  const checkConflicts = (profileId: string) => {
    const profileIdNum = Number(profileId);
    for (const course of allCourses) {
      if (course._id !== module._id) {
        // Ensure assignedUsers is an array, default to []
        const assignedUserIds = Array.isArray(course.assignedUsers) ? course.assignedUsers : [];
        if (assignedUserIds.includes(profileIdNum)) {
          for (const time of course.times) {
            for (const range of time.dateRanges) {
              for (const session of module.times) {
                for (const moduleRange of session.dateRanges) {
                  const start1 = new Date(moduleRange.startTime);
                  const end1 = new Date(moduleRange.endTime);
                  const start2 = new Date(range.startTime);
                  const end2 = new Date(range.endTime);

                  if (
                    (start1 >= start2 && start1 <= end2) ||
                    (end1 >= start2 && end1 <= end2) ||
                    (start2 >= start1 && start2 <= end1) ||
                    (end2 >= start1 && end2 <= end1)
                  ) {
                    return { type: 'course', course };
                  }
                }
              }
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
    // Validation
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
    if (course.support?.type === "link" && course.support.value && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(course.support.value)) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Lien de support invalide.",
        });
        return;
    }
    for (const time of course.times || []) {
      if (!time.instructorName) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Tous les créneaux doivent avoir un instructeur.",
        });
        return;
      }
      for (const dateRange of time.dateRanges) {
        if (!dateRange.startTime || !dateRange.endTime) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Tous les créneaux doivent avoir une heure de début et de fin.",
          });
          return;
        }
        const start = new Date(dateRange.startTime);
        const end = new Date(dateRange.endTime);
        if (isNaN(start) || isNaN(end)) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Format de date invalide dans les créneaux.",
          });
          return;
        }
        if (start >= end) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "L'heure de début doit être avant l'heure de fin pour chaque période.",
          });
          return;
        }
      }
      if (time.instructorType === "extern" && !time.externalInstructorDetails.phone) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Un numéro de téléphone est requis pour les instructeurs externes.",
        });
        return;
      }
    }

    const courseData = {
      ...course,
      assignedUsers: assignedUsers.map((user) => user.id_profile.toString()),
      // imageUrl: course.imageUrl,
      photos: course.photos,
      link: course.link,
      support: course.support
    };

    try {
      // Step 1: Map id_profile to User._id
      const profileIds = assignedUsers.map((user) => Number(user.id_profile));
      console.log("Sending profileIds to map:", profileIds);
      // const userMappingResponse = await useApiAxios.post("/users/map-by-profile-ids", {
      //   profileIds,
      // });
      // console.log("User Mapping Response:", userMappingResponse.data);
      // const mappedUserIds = userMappingResponse.data.map((item: { userId: string }) => item.userId);

      // if (mappedUserIds.length !== profileIds.length) {
      //   console.warn("Mismatch detected:", {
      //     sent: profileIds.length,
      //     received: mappedUserIds.length,
      //     missing: profileIds.filter((id) => !mappedUserIds.includes(id.toString())),
      //   });
      //   toast({
      //     variant: "destructive",
      //     title: "Erreur",
      //     description: "Certains profils n'ont pas d'utilisateurs correspondants. Veuillez synchroniser les données ou contacter l'administrateur.",
      //   });
      //   return;
      // }

      // courseData.assignedUsers = mappedUserIds;

      const courseData = {
        ...course,
        assignedUsers: profileIds,
        // imageUrl: course.imageUrl,
        photos: course.photos,
        link: course.link,
        support: course.support,
      };

      if (course.photosFiles?.length || course.times.some((session) => session.externalInstructorDetails?.cv instanceof File)) {
        const formData = new FormData();
        // if (course.image) {
        //   formData.append("image", course.image);
        // }

        if (course.photosFiles?.length) {
          course.photosFiles.forEach((photo) => {
            formData.append("photos", photo)
          })
        }

        if (course.support?.type === 'file' && course.support.value) {
          formData.append("support", course.support.value);
        }
        
        course.times.forEach((session, index) => {
          if (session.externalInstructorDetails?.cv instanceof File) {
            formData.append("cvs", session.externalInstructorDetails.cv);
          }
        });

        const imageUploadResponse = await useApiAxios.post("/courses/uploadImage", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // if (imageUploadResponse.status === 200) {
        //   if (imageUploadResponse.data.imageUrl) {
        //     courseData.imageUrl = imageUploadResponse.data.imageUrl;
        //   }
          courseData.photos = [...(course.photos || []), ...(imageUploadResponse.data.photoUrls || [])];
          courseData.times = course.times.map((session, index) => ({
            ...session,
            externalInstructorDetails: {
              ...session.externalInstructorDetails,
              cv: imageUploadResponse.data.cvUrls && imageUploadResponse.data.cvUrls[index]
                ? imageUploadResponse.data.cvUrls[index]
                : session.externalInstructorDetails.cv,
            },
          }));
        } else {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: 'Erreur lors de la cr&ation du cours',
          });
          return;
        }
      // }

      for (const user of assignedUsers) {
        const conflictCourse = checkConflicts(user.id_profile.toString());
        if (conflictCourse) {
          await useApiAxios.put(`/courses/${conflictCourse.course._id}`, {
            ...conflictCourse.course,
            assignedUsers: (conflictCourse.course.assignedUsers as any[])
              // .map((u) => (typeof u === "string" ? u : u.id_profile.toString()))
              .filter((id) => id !== Number(user.id_profile)),
          });
        }
      }

      console.log("Sending courseData to update:", courseData);
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
      // imageUrl: "",
      photos: [],
      link: "",
      offline: "offline",
      description: "",
      hidden: "hidden",
      budget: 0,
      notification: [],
      times: [
        {
          dateRanges: [{ startTime: "", endTime: "" }],
          instructorType: "intern",
          instructor: "",
          instructorName: "",
          externalInstructorDetails: { phone: "", position: "", cv: null },
        },
      ],
      // image: null,
      support: {
        type: "link",
        value: ""
      },
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
    // if (!course.title || !course.location || !course.offline || !course.hidden || course.budget == null) {
    //   toast({
    //     variant: "destructive",
    //     title: "Erreur",
    //     description: "Veuillez remplir tous les champs obligatoires avant de continuer.",
    //   });
    //   return;
    // }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  if (!module) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Aucun module sélectionné.",
    });
    return null;
  }

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
              {/* <div className="space-y-2">
                <Label>Image (illustration du module)</Label>
                <div
                  {...getImageRootProps()}
                  className={`border-2 border-dashed p-4 text-center ${
                    isImageDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <input {...getImageInputProps()} accept="image/jpeg,image/png,image/gif" />
                  <p className="text-gray-600">
                    {isImageDragActive
                      ? "Déposez l'image ici..."
                      : "Glissez-déposez une image ici, ou cliquez pour sélectionner (JPEG, PNG, GIF, max 5 Mo)"}
                  </p>
                </div>
                {course.image ? (
                  <div className="relative">
                    <img
                      src={course.image.preview}
                      alt="Aperçu de l'illustration"
                      className="mt-4 w-full h-auto rounded"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                      onClick={() => setCourse((prev) => ({ ...prev, image: null }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : course.imageUrl ? (
                  <div className="relative">
                    <img
                      src={`${baseUrl}${course.imageUrl}`}
                      alt="Illustration du module"
                      className="mt-4 w-full h-auto rounded"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                      onClick={() => setCourse((prev) => ({ ...prev, imageUrl: "" }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div> */}
              <div className="space-y-2">
                <Label>Photos (Photos prises du module)</Label>
                <div
                  {...getPhotosRootProps()}
                  className={`border-2 border-dashed p-4 text-center ${
                    isPhotosDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <input {...getPhotosInputProps()} accept="image/jpeg,image/png,image/gif" />
                  <p className="text-gray-600">
                    {isPhotosDragActive
                      ? "Déposez les photos ici..."
                      : "Glissez-déposez des photos ici, ou cliquez pour sélectionner (JPEG, PNG, GIF, max 5 Mo par photo)"}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {course.photosFiles?.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-auto rounded"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {course.photos?.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`${baseUrl}${url}`}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-auto rounded"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                        onClick={() =>
                          setCourse((prev) => ({
                            ...prev,
                            photos: prev.photos?.filter((_, i) => i !== index) || [],
                          }))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Lien de photos (optionel)</Label>
                <Input
                  id="link"
                  placeholder="Entrez un lien (optionnel)"
                  value={course.link || ""}
                  onChange={(e) => handleInputChange("link", e.target.value)}
                />
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
              <div className="space-y-2">
                                <Label htmlFor="support-type">Type de support</Label>
                                <Select
                                    value={course.support?.type}
                                    onValueChange={(value) => handleSupportChange(value, "")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner le type de support" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="link">Lien</SelectItem>
                                        <SelectItem value="file">Fichier</SelectItem>
                                    </SelectContent>
                                </Select>
                              </div>
                              {course.support?.type === "link" ? (
                                <div className="space-y-2">
                                    <Label htmlFor="support-link">Lien du support</Label>
                                    <Input
                                        id="support-link"
                                        placeholder="Entrez le lien (https://...)"
                                        value={course.support.value}
                                        onChange={(e) => handleSupportChange("link", e.target.value)}
                                    />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label>Fichier de support</Label>
                                  <div
                                      {...getSupportRootProps()}
                                      className={`border-2 border-dashed p-4 text-center ${
                                          isSupportDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"
                                      }`}
                                  >
                                      <input {...getSupportInputProps()} accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif" />
                                      <p className="text-gray-600">
                                          {isSupportDragActive
                                              ? "Déposez le fichier ici..."
                                              : "Glissez-déposez un fichier ici, ou cliquez pour sélectionner (PDF, Word, JPEG, PNG, GIF, max 5 Mo)"}
                                      </p>
                                  </div>
                                  {course.support?.value && course.support.type === "file" && (
                                      <p className="mt-2 text-sm text-gray-600">
                                          Fichier sélectionné : {course.support.value.name}
                                      </p>
                                  )}
                                </div>
                              )}
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Planification</h3>
              {(course.times || []).map((session, sessionIndex) => (
                <div key={sessionIndex} className="border rounded-lg p-4 space-y-4">
                  <h4 className="text-md font-medium">Session {sessionIndex + 1}</h4>
                  {session.dateRanges.map((dateRange, dateRangeIndex) => (
                    <div key={dateRangeIndex} className="grid grid-cols-2 gap-4 border-b pb-2">
                      <div className="space-y-2">
                        <Label htmlFor={`startTime-${sessionIndex}-${dateRangeIndex}`}>Heure de début</Label>
                        <Input
                          id={`startTime-${sessionIndex}-${dateRangeIndex}`}
                          type="datetime-local"
                          value={dateRange.startTime}
                          onChange={(e) =>
                            handleDateRangeChange(sessionIndex, dateRangeIndex, "startTime", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`endTime-${sessionIndex}-${dateRangeIndex}`}>Heure de fin</Label>
                        <Input
                          id={`endTime-${sessionIndex}-${dateRangeIndex}`}
                          type="datetime-local"
                          value={dateRange.endTime}
                          onChange={(e) =>
                            handleDateRangeChange(sessionIndex, dateRangeIndex, "endTime", e.target.value)
                          }
                          required
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDateRange(sessionIndex, dateRangeIndex)}
                        className="col-span-2 justify-self-end"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => handleAddDateRange(sessionIndex)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une période
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor={`instructorType-${sessionIndex}`}>Type d'instructeur</Label>
                    <Select
                      value={session.instructorType}
                      onValueChange={(value) => handleSessionChange(sessionIndex, "instructorType", value)}
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
                      <Label htmlFor={`instructor-${sessionIndex}`}>Instructeur</Label>
                      <Popover
                        open={openInstructorPopover[sessionIndex]}
                        onOpenChange={(open) =>
                          setOpenInstructorPopover((prev) => ({ ...prev, [sessionIndex]: open }))
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
                                      handleSessionChange(sessionIndex, "instructor", instructor)
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
                        <Label htmlFor={`instructorName-${sessionIndex}`}>Nom de l'instructeur</Label>
                        <Input
                          id={`instructorName-${sessionIndex}`}
                          placeholder="Entrez le nom"
                          value={session.instructorName}
                          onChange={(e) =>
                            handleSessionChange(sessionIndex, "instructorName", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${sessionIndex}`}>Téléphone</Label>
                        <Input
                          id={`phone-${sessionIndex}`}
                          placeholder="Entrez le numéro de téléphone"
                          value={session.externalInstructorDetails.phone}
                          onChange={(e) =>
                            handleSessionChange(sessionIndex, "phone", e.target.value, true)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`position-${sessionIndex}`}>Poste</Label>
                        <Input
                          id={`position-${sessionIndex}`}
                          placeholder="Entrez le poste"
                          value={session.externalInstructorDetails.position}
                          onChange={(e) =>
                            handleSessionChange(sessionIndex, "position", e.target.value, true)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`cv-${sessionIndex}`}>CV</Label>
                        <Input
                          id={`cv-${sessionIndex}`}
                          type="file"
                          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={(e) =>
                            handleSessionChange(sessionIndex, "cv", e.target.files?.[0], true)
                          }
                        />
                        {session.externalInstructorDetails.cv && typeof session.externalInstructorDetails.cv === "string" && (
                          <p className="text-sm text-gray-600">
                            CV actuel: <a href={`${baseUrl}${session.externalInstructorDetails.cv}`} target="_blank" rel="noopener noreferrer">Télécharger</a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSession(sessionIndex)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicateSession(sessionIndex)}
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
              {error as Error && (
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
                            const conflict = checkConflicts(user.id_profile.toString());
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
                      {user.name|| `Unknown User (${user.id_profile})`}
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