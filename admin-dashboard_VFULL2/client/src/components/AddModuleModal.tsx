"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { ChevronLeft, ChevronRight, Plus, Copy, X, BookMarked } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx";
import { useDropzone } from "react-dropzone";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useApiAxios from "../config/axios";
import { useToast } from "../hooks/use-toast.ts";
import { Checkbox } from "./ui/checkbox.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogTitle } from "./ui/dialog.tsx";
import { cleanIndexes } from "../../../server/models/Course.js";

export function AddModuleModal({ onCourseCreated }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const [course, setCourse] = useState({
    title: "",
    location: "",
    category: null, // { id, name }
    offline: "",
    description: "",
    hidden: "",
    budget: "",
    times: [
      {
        dateRanges: [{ startTime: "", endTime: "" }],
        instructor: "",
        instructorName: "",
        instructorType: "intern",
        externalInstructorDetails: {
          phone: "",
          position: "",
          cv: null,
        },
      },
    ],
    image: null,
    support: {
        type: "link",
        value: ""
    }
  });

  const [categories, setCategories] = useState([]);
  const [internalInstructors, setInternalInstructors] = useState([]);
  const [openInstructorPopover, setOpenInstructorPopover] = useState({});

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const internalResponse = await useApiAxios.get("/users");
        setInternalInstructors(
          internalResponse.data.map((instructor) => ({
            label: instructor.name,
            id: instructor._id,
          }))
        );
      } catch (error) {
        console.error("Échec de la récupération des instructeurs:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les instructeurs.",
        });
      }
    };

    const fetchCategories = async () => {
      try {
        const { data } = await useApiAxios.get("/category");
        setCategories(
          data.map((category) => ({
            id: category._id,
            name: category.name,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les catégories.",
        });
      }
    };

    fetchInstructors();
    fetchCategories();
  }, [toast]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "L'image ne doit pas dépasser 5 Mo.",
        });
        return;
      }
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Seuls les formats JPEG, PNG et GIF sont acceptés.",
        });
        return;
      }
      setCourse((prev) => ({
        ...prev,
        image: Object.assign(file, {
          preview: URL.createObjectURL(file),
        }),
      }));
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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

  const handleInputChange = (field, value) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = async (category) => {
    if (category.inputValue) {
      try {
        const response = await useApiAxios.post("/category", {
          name: category.inputValue,
        });
        const newCategory = { id: response.data._id, name: category.inputValue };
        setCategories((prev) => [...prev, newCategory]);
        setCourse((prev) => ({ ...prev, category: newCategory }));
        toast({ title: "Succès", description: "Nouvelle catégorie ajoutée." });
      } catch (error) {
        console.error("Failed to add new category:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Échec de l'ajout de la catégorie.",
        });
      }
    } else {
      setCourse((prev) => ({ ...prev, category }));
    }
    setSearchCategory("");
    setOpenCategoryPopover(false);
    setTimeout(() => categoryInputRef.current?.focus(), 100);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await useApiAxios.delete(`/category/${categoryId}`);
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      if (course.category?.id === categoryId) {
        setCourse((prev) => ({ ...prev, category: null }));
      }
      toast({ title: "Succès", description: "Catégorie supprimée." });
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Échec de la suppression de la catégorie.",
      });
    }
  };

  const handleSessionChange = (index, field, value, isExternalDetail = false) => {
    const updatedTimes = [...course.times];
    if (isExternalDetail) {
      // Validate CV file size and type
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
    } else if (field === "instructor") {
      updatedTimes[index].instructor = value?.id || "";
      updatedTimes[index].instructorName = value?.label || "";
    } else {
      updatedTimes[index][field] = value;
    }
    setCourse((prev) => ({ ...prev, times: updatedTimes }));
  };

  const handleDateRangeChange = (sessionIndex, dateRangeIndex, field, value) => {
    const updatedTimes = [...course.times];
    updatedTimes[sessionIndex].dateRanges[dateRangeIndex][field] = value;
    setCourse((prev) => ({ ...prev, times: updatedTimes }));
  };

  const handleAddDateRange = (sessionIndex) => {
    const updatedTimes = [...course.times];
    updatedTimes[sessionIndex].dateRanges.push({ startTime: "", endTime: "" });
    setCourse((prev) => ({ ...prev, times: updatedTimes }));
  };

  const handleRemoveDateRange = (sessionIndex, dateRangeIndex) => {
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
        ...prev.times,
        {
          dateRanges: [{ startTime: "", endTime: "" }],
          instructor: "",
          instructorName: "",
          instructorType: "intern",
          externalInstructorDetails: { phone: "", position: "", cv: null },
        },
      ],
    }));
  };

  const handleDuplicateSession = (index) => {
    const session = { ...course.times[index], dateRanges: [...course.times[index].dateRanges] };
    setCourse((prev) => ({
      ...prev,
      times: [...prev.times, session],
    }));
  };

  const handleRemoveSession = (index) => {
    setCourse((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!course.image) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez télécharger une image." });
      setIsSubmitting(false);
      return;
    }
    if (
      !course.title ||
      !course.offline ||
      !course.hidden ||
      course.budget === "" ||
      !course.location ||
      !course.times.length ||
      !course.category
    ) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
      });
      setIsSubmitting(false);
      return;
    }
    if (course.support.type === "link" && course.support.value && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(course.support.value)) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Lien de support invalide.",
        });
        setIsSubmitting(false);
        return;
    }
    for (const session of course.times) {
      if (!session.instructorName) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Tous les créneaux doivent avoir un instructeur.",
        });
        setIsSubmitting(false);
        return;
      }
      for (const dateRange of session.dateRanges) {
        if (!dateRange.startTime || !dateRange.endTime) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Tous les créneaux doivent avoir une heure de début et de fin.",
          });
          setIsSubmitting(false);
          return;
        }
        const start = new Date(dateRange.startTime);
        const end = new Date(dateRange.endTime);
        if (start >= end) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "L'heure de début doit être avant l'heure de fin pour chaque période.",
          });
          setIsSubmitting(false);
          return;
        }
      }
      if (session.instructorType === "extern" && !session.externalInstructorDetails.phone) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Un numéro de téléphone est requis pour les instructeurs externes.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Prepare FormData for image and CV uploads
      const formData = new FormData();
      formData.append("image", course.image);
      course.times.forEach((session) => {
        if (session.externalInstructorDetails?.cv) {
          formData.append("cvs", session.externalInstructorDetails.cv);
        }
      });

      if (course.support.type === "file" && course.support.value) {
        formData.append("support", course.support.value);
      }

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value.name || value}`);
      }

      console.log("Uploading image, CVs & support...");
      const imageUploadResponse = await useApiAxios.post("/courses/uploadImage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (imageUploadResponse.status === 200) {
        const { imageUrl, cvUrls, supportUrl } = imageUploadResponse.data;
        console.log("Image uploaded successfully, imageUrl:", imageUrl, "cvUrls:", cvUrls, "supportUrl:", supportUrl);

        const finalCourseData = {
          ...course,
          imageUrl,
          category: course.category ? course.category.id : null,
          support: {
            type: course.support.type,
            value: course.support.type === "file" && supportUrl ? supportUrl : course.support.value
          },
          times: course.times.map((session, index) => ({
            ...session,
            instructor: session.instructor || undefined,
            externalInstructorDetails: {
              ...session.externalInstructorDetails,
              cv: cvUrls && cvUrls[index] ? cvUrls[index] : undefined,
            },
          })),
          assignedUsers: [],
          interestedUsers: [],
        };

        console.log("Submitting course data:", finalCourseData);
        const response = await useApiAxios.post("/courses", finalCourseData);

        if (response.status === 201) {
          toast({ title: "Succès", description: "Cours créé avec succès." });
          setOpen(false);
          setCourse({
            title: "",
            location: "",
            category: null,
            offline: "",
            description: "",
            hidden: "",
            budget: "",
            times: [
              {
                dateRanges: [{ startTime: "", endTime: "" }],
                instructor: "",
                instructorName: "",
                instructorType: "intern",
                externalInstructorDetails: { phone: "", position: "", cv: null },
              },
            ],
            image: null,
            support: {
                        type: "link",
                        value: ""
                    }
          });
          setCurrentStep(1);
          if (onCourseCreated) onCourseCreated();
        } else {
          throw new Error(`Course creation failed with status: ${response.status}`);
        }
      } else {
        throw new Error(`Image upload failed with status: ${imageUploadResponse.status}`);
      }

      // if (onCourseCreated) {
      //   onCourseCreated();
      // }

    } catch (error) {
      console.error("Erreur lors de la création du cours:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.response?.data?.message || "Échec de la création du cours.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    // if (!course.title || !course.location || !course.category || !course.offline || !course.hidden || !course.budget || !course.image) {
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

  const handleClose = () => {
    setCourse({
      title: "",
      location: "",
      category: null,
      offline: "",
      description: "",
      hidden: "",
      budget: "",
      times: [
        {
          dateRanges: [{ startTime: "", endTime: "" }],
          instructor: "",
          instructorName: "",
          instructorType: "intern",
          externalInstructorDetails: { phone: "", position: "", cv: null },
        },
      ],
      image: null,
      support: {
        type: "link",
        value: ""
      }
    });
    setCurrentStep(1);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-gray-50 rounded-xl border-blue-700 hover:bg-gray-100 transition-all duration-200"
        >
          <Plus className="h-5 w-5" /> Créer Module
        </Button>
      </DialogTrigger>
      <DialogContent className="w-4/6 max-w-2xl rounded-2xl bg-white overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookMarked className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-xl">Formulaire Module</DialogTitle>
          </div>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center justify-items-center">
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
              <div className="text-center justify-items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </div>
                <span className="text-sm text-gray-600">Planification</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          <form onSubmit={handleSubmit}>
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
                  <Label htmlFor="category">Catégorie</Label>
                  <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {course.category?.name || "Sélectionner une catégorie"}
                        <ChevronRight className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          ref={categoryInputRef}
                          placeholder="Rechercher ou ajouter une catégorie..."
                          value={searchCategory}
                          onValueChange={setSearchCategory}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              variant="ghost"
                              onClick={() => handleCategorySelect({ inputValue: searchCategory })}
                            >
                              Ajouter "{searchCategory}" comme nouvelle catégorie
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {categories.map((category) => (
                              <CommandItem
                                key={category.id}
                                value={category.name}
                                onSelect={() => handleCategorySelect(category)}
                                className="flex justify-between items-center w-full"
                              >
                                <div className="flex items-center">
                                  <Checkbox
                                    className={`mr-2 h-4 w-4 ${
                                      course.category?.id === category.id ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {category.name}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCategory(category.id);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Image (illustration du module)</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed p-4 text-center ${
                      isDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"
                    }`}
                  >
                    <input {...getInputProps()} accept="image/jpeg,image/png,image/gif" />
                    <p className="text-gray-600">
                      {isDragActive
                        ? "Déposez l'image ici..."
                        : "Glissez-déposez une image ici, ou cliquez pour sélectionner (JPEG, PNG, GIF, max 5 Mo)"}
                    </p>
                  </div>
                  {course.image && (
                    <div className="relative">
                      <img
                        src={course.image.preview}
                        alt="Aperçu"
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
                  )}
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
                      <SelectItem value="hidden">Caché</SelectItem>
                      <SelectItem value="visible">Visible</SelectItem>
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
                <div className="space-y-2">
                  <Label htmlFor="support-type">Type de support</Label>
                  <Select
                      value={course.support.type}
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
                {course.support.type === "link" ? (
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
                    {course.support.value && course.support.type === "file" && (
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
                {course.times.map((session, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <h4 className="text-md font-medium">Session {index + 1}</h4>
                    {session.dateRanges.map((dateRange, dateRangeIndex) => (
                      <div key={dateRangeIndex} className="grid grid-cols-2 gap-4 border-b pb-2">
                        <div className="space-y-2">
                          <Label htmlFor={`startTime-${index}-${dateRangeIndex}`}>Heure de début</Label>
                          <Input
                            id={`startTime-${index}-${dateRangeIndex}`}
                            type="datetime-local"
                            value={dateRange.startTime}
                            onChange={(e) =>
                              handleDateRangeChange(index, dateRangeIndex, "startTime", e.target.value)
                            }
                            required
                          />
                        </div>
                      <div className="space-y-2">
                          <Label htmlFor={`endTime-${index}-${dateRangeIndex}`}>Heure de fin</Label>
                          <Input
                            id={`endTime-${index}-${dateRangeIndex}`}
                            type="datetime-local"
                            value={dateRange.endTime}
                            onChange={(e) =>
                              handleDateRangeChange(index, dateRangeIndex, "endTime", e.target.value)
                            }
                            required
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDateRange(index, dateRangeIndex)}
                          className="col-span-2 justify-self-end"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => handleAddDateRange(index)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une période
                    </Button>
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
                                      <Checkbox
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
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`cv-${index}`}>CV</Label>
                          <Input
                            id={`cv-${index}`}
                            type="file"
                            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) =>
                              handleSessionChange(index, "cv", e.target.files[0], true)
                            }
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
              {currentStep < 2 ? (
                <Button
                  variant="outline"
                  onClick={handleNextStep}
                  disabled={!course.title || !course.location || !course.category || !course.offline || !course.hidden || !course.budget || !course.image}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer le cours"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}