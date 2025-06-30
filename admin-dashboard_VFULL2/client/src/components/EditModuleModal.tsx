"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { ChevronLeft, ChevronRight, Plus, Copy, X, Edit } from "lucide-react";
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

interface Course {
  _id: string;
  title: string;
  offline: boolean;
  description: string;
  hidden: boolean;
  budget: number;
  location: string;
  imageUrl: string;
  notification: [];
  times: [
      {
        startTime: "",
        endTime: "",
        instructorType: "",
        instructor: "",
        instructorName: "",
        externalInstructorDetails: {
          phone: "",
          position: "",
          cv: null,
        },
      },
    ];
    image: string;
    assignedUsers: [];
    interestedUsers: []
}

interface EditModuleModalProps {
  module: Course;
}

export function EditModuleModal({ module }: EditModuleModalProps) {

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

  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [internalInstructors, setInternalInstructors] = useState([]);
  const [filter, setFilter] = useState({
    fonction: null,
    localite: null,
    service: null,
    departementDivision: null,
    affectation: null,
    gradeAssimile: null,
    gradeFonction: null,
  });
  const [allCourses, setAllCourses] = useState([]);
  const baseUrl = "https://anep-proejct.onrender.com";

  useEffect(() => {
    const fetchUsersAndCourse = async () => {
      try {
        const usersResponse = await useApiAxios.get("/users");
        const allCoursesResponse = await useApiAxios.get("/courses");

        setUsers(usersResponse.data);
        setInternalInstructors(
          usersResponse.data.map((instructor) => ({
            label: instructor.name,
            id: instructor._id,
          }))
        );
        setAllCourses(allCoursesResponse.data);

      } catch (error) {
        console.error("Failed to fetch data", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les données.",
        });
      }
    };
    fetchUsersAndCourse();
  }, [toast]);

  useEffect(() => {
    if (course.interestedUsers) {
      setInterestedUsers(course.interestedUsers);
    }
  }, [course]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setCourse((prev) => ({
        ...prev,
        image: Object.assign(file, { preview: URL.createObjectURL(file) }),
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleInputChange = (field, value) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  const handleSessionChange = (index, field, value, isExternalDetail = false) => {
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
      updatedTimes[index].instructor = value?.id || "";
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

  const handleDuplicateSession = (index) => {
    const session = course.times[index];
    setCourse((prev) => ({
      ...prev,
      times: [...prev.times, { ...session }],
    }));
  };

  const handleRemoveSession = (index) => {
    setCourse((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  };

  const handleFilterChange = debounce((field, value) => {
    setFilter((prev) => ({ ...prev, [field]: value }));
  }, 300);

  const uniqueOptions = (field) => {
    const unique = new Set(users.map((user) => user[field]));
    return Array.from(unique).map((value) => ({ label: value }));
  };

  const filteredUsers = users.filter(
    (user) =>
      (!filter.fonction || user.FONCTION === filter.fonction?.label) &&
      (!filter.localite || user.Localite === filter.localite?.label) &&
      (!filter.service || user.SERVICE === filter.service?.label) &&
      (!filter.departementDivision ||
        user.DEPARTEMENT_DIVISION === filter.departementDivision?.label) &&
      (!filter.affectation || user.AFFECTATION === filter.affectation?.label) &&
      (!filter.gradeAssimile ||
        user.GRADE_ASSIMILE === filter.gradeAssimile?.label) &&
      (!filter.gradeFonction ||
        user.GRADE_fonction === filter.gradeFonction?.label) &&
      !assignedUsers.some((assignedUser) => assignedUser._id === user._id)
  );

  const checkConflicts = (userId, startTime, endTime) => {
    const user = users.find((user) => user._id === userId);
    if (!user) return null;

    for (const course of allCourses) {
      if (course._id !== id && course.assignedUsers.includes(userId)) {
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

    for (const vacation of user.vacations) {
      if (
        (new Date(startTime) >= new Date(vacation.start) &&
          new Date(startTime) <= new Date(vacation.end)) ||
        (new Date(endTime) >= new Date(vacation.start) &&
          new Date(endTime) <= new Date(vacation.end))
      ) {
        return { type: "vacation", vacation };
      }
    }

    return null;
  };

  const handleAssignUser = (userId) => {
    const userToAssign = interestedUsers.find((user) => user && user._id === userId);
    if (userToAssign) {
      setAssignedUsers((prev) => [...prev, userToAssign].filter((user) => user));
    }
  };

  const filteredInterestedUsers = course.interestedUsers.filter(
    (interestedUser) =>
      !assignedUsers.some((assignedUser) => assignedUser._id === interestedUser._id)
  );

  const handleUserToggle = (user) => {
    setAssignedUsers((prev) => {
      const exists = prev.some((u) => u._id === user._id);
      return exists
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user];
    });
    setSearchUser("");
    setOpenUserPopover(false);
    setTimeout(() => userInputRef.current?.focus(), 100);
  };

  const handleSubmit = async () => {
    if (!course.title || !course.offline || !course.hidden || course.budget === "" || !course.location || !course.times.length) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      return;
    }
    for (const time of course.times) {
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
      assignedUsers: assignedUsers.map((user) => user._id),
    };

    try {
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
        const conflictCourse = checkConflicts(user._id, course.times[0].startTime, course.times[0].endTime);
        if (conflictCourse) {
          await useApiAxios.put(`/courses/${conflictCourse._id}`, {
            ...conflictCourse,
            assignedUsers: conflictCourse.assignedUsers.filter((u) => u._id !== user._id),
          });
        }
      }

      await useApiAxios.put(`/courses/${module._id}`, courseData);
      toast({ title: "Succès", description: "Cours mis à jour avec succès." });
      setCurrentStep(1);
      setOpen(false);
    } catch (error) {
      console.error("Failed to update course", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la mise à jour du cours.",
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
      service: null,
      departementDivision: null,
      affectation: null,
      gradeAssimile: null,
      gradeFonction: null,
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
                  value={course.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  placeholder="Entrez le lieu"
                  value={course.location}
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
                  value={course.offline}
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
                  value={course.hidden}
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
                  value={course.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Planification</h3>
              {course.times.map((session, index) => (
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
                                        session.instructor === instructor.id
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
                            handleSessionChange(index, "cv", e.target.files[0], true)
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
    <h3 className="text-lg font-semibold text-gray-900">Assigner des Utilisateurs</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Fonction", field: "fonction" },
        { label: "Localité", field: "localite" },
        { label: "Service", field: "service" },
        { label: "Département/Division", field: "departementDivision" },
        { label: "Affectation", field: "affectation" },
        { label: "Grade Assimilé", field: "gradeAssimile" },
        { label: "Grade Fonction", field: "gradeFonction" },
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
                    {uniqueOptions(field === "gradeFonction" ? "GRADE_fonction" : field.toUpperCase()).map((option) => (
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
                    user._id,
                    course.times[0]?.startTime,
                    course.times[0]?.endTime
                  );
                  return (
                    <CommandItem
                      key={user._id}
                      value={user.name}
                      onSelect={() => handleUserToggle(user)}
                      className={`text-sm ${conflict ? (conflict.type === "course" ? "text-red-500" : "text-yellow-500") : ""}`}
                    >
                      <Checkbox
                        className={`mr-2 h-4 w-4 ${
                          assignedUsers.some((u) => u._id === user._id) ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      <span>{user.name}</span>
                      {conflict && conflict.type === "course" && (
                        <span className="ml-2 text-red-500 text-xs">
                          (Conflit avec : {conflict.course.title})
                        </span>
                      )}
                      {conflict && conflict.type === "vacation" && (
                        <span className="ml-2 text-yellow-500 text-xs">(En vacances)</span>
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
            key={user._id}
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
          key={user._id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm text-gray-700">{user.name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAssignUser(user._id)}
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

