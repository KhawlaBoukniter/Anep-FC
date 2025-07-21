'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import Header from './header.tsx';
import Footer from './footer.tsx';
import {
  useIndisponibilitesByEmploye,
  useCreateIndisponibilite,
  useUpdateIndisponibilite,
  useDeleteIndisponibilite,
} from '../hooks/useIndisponibilites.ts';
import { Button } from './ui/button.tsx';
import { Card, CardContent } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog.tsx';
import { Input } from './ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select.tsx';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface Indisponibilite {
  id_indisponibilite: number;
  id_employe: number;
  type_indisponibilite: 'CONGE' | 'REUNION_HEBDOMADAIRE' | 'AUTRE';
  date_debut: string;
  date_fin: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

interface NewIndisponibilite {
  id_employe: number;
  type_indisponibilite: 'CONGE' | 'REUNION_HEBDOMADAIRE' | 'AUTRE';
  date_debut: string;
  date_fin: string;
  description: string;
}

const Indisponibilite: React.FC = () => {
  const [employeId, setEmployeId] = useState<number | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    'toutes' | 'CONGE' | 'REUNION_HEBDOMADAIRE' | 'AUTRE'
  >('toutes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<NewIndisponibilite>({
    id_employe: 0,
    type_indisponibilite: 'CONGE',
    date_debut: '',
    date_fin: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Récupérer l'ID de l'employé connecté
  useEffect(() => {
    const verifySession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthError('Veuillez vous connecter pour accéder à vos indisponibilités.');
          setLoadingAuth(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/employees/verify-session`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEmployeId(response.data.id);
        setFormData((prev) => ({ ...prev, id_employe: response.data.id }));
        setLoadingAuth(false);
      } catch (err: any) {
        console.error('Erreur lors de la vérification de la session:', err);
        setAuthError('Session invalide. Veuillez vous reconnecter.');
        setLoadingAuth(false);
      }
    };
    verifySession();
  }, []);

  // Rediriger vers la page de connexion si non authentifié
  useEffect(() => {
    if (!loadingAuth && !employeId && !authError) {
      window.location.href = '/';
    }
  }, [loadingAuth, employeId, authError]);

  // Récupérer les indisponibilités de l'employé
  const {
    data: indisponibilites = [],
    isLoading,
    isError,
    error: queryError,
  } = useIndisponibilitesByEmploye(employeId);

  // Mutations pour les opérations CRUD
  const createIndisponibilite = useCreateIndisponibilite();
  const updateIndisponibilite = useUpdateIndisponibilite();
  const deleteIndisponibilite = useDeleteIndisponibilite();

  // Gestion de l'ajout ou de la mise à jour
  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeId) {
      setError('Utilisateur non authentifié');
      return;
    }
    if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
      setError('La date de fin doit être postérieure à la date de début');
      return;
    }
    if (formData.type_indisponibilite === 'AUTRE' && !formData.description.trim()) {
      setError('Une description est requise pour le type "Autre"');
      return;
    }

    if (editingId) {
      updateIndisponibilite.mutate(
        { id: editingId, data: formData },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setFormData({
              id_employe: employeId,
              type_indisponibilite: 'CONGE',
              date_debut: '',
              date_fin: '',
              description: '',
            });
            setEditingId(null);
            setError(null);
          },
          onError: (err: any) => setError(err.response?.data?.message || 'Erreur lors de la mise à jour'),
        }
      );
    } else {
      createIndisponibilite.mutate(formData, {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({
            id_employe: employeId,
            type_indisponibilite: 'CONGE',
            date_debut: '',
            date_fin: '',
            description: '',
          });
          setError(null);
        },
        onError: (err: any) => setError(err.response?.data?.message || 'Erreur lors de la création'),
      });
    }
  };

  // Gestion de la suppression
  const handleDelete = () => {
    if (!deleteId) return;
    deleteIndisponibilite.mutate(deleteId, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      },
      onError: (err: any) => setError(err.response?.data?.message || 'Erreur lors de la suppression'),
    });
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (indisponibilite: Indisponibilite) => {
    setFormData({
      id_employe: employeId!,
      type_indisponibilite: indisponibilite.type_indisponibilite,
      date_debut: indisponibilite.date_debut,
      date_fin: indisponibilite.date_fin,
      description: indisponibilite.description || '',
    });
    setEditingId(indisponibilite.id_indisponibilite);
    setIsModalOpen(true);
  };

  const getStatusBadge = (type: string) => {
    switch (type) {
      case 'CONGE':
        return (
          <Badge className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
            Congé
          </Badge>
        );
      case 'REUNION_HEBDOMADAIRE':
        return (
          <Badge className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            Réunion Hebdomadaire
          </Badge>
        );
      case 'AUTRE':
        return (
          <Badge className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            Autre
          </Badge>
        );
      default:
        return null;
    }
  };

  const getFilteredIndisponibilites = () => {
    if (selectedTab === 'toutes') return indisponibilites.filter((i) => !i.archived);
    return indisponibilites.filter((i) => i.type_indisponibilite === selectedTab && !i.archived);
  };

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), 'dd MMMM yyyy HH:mm', { locale: fr });
  };

  const totalSlots = indisponibilites.filter((i) => !i.archived).length;
  const congeSlots = indisponibilites.filter((i) => i.type_indisponibilite === 'CONGE' && !i.archived).length;
  const reunionSlots = indisponibilites.filter(
    (i) => i.type_indisponibilite === 'REUNION_HEBDOMADAIRE' && !i.archived
  ).length;
  const autreSlots = indisponibilites.filter((i) => i.type_indisponibilite === 'AUTRE' && !i.archived).length;

  if (loadingAuth || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (authError || isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {authError || (queryError as Error)?.message || 'Une erreur inconnue s\'est produite'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-[#06668C] via-blue-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="opacity-100 translate-y-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Mes Indisponibilités</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Gérez vos indisponibilités et suivez vos créneaux
            </p>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="py-12 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-6 bg-gradient-to-br from-[#06668C] to-blue-700 text-white rounded-xl">
              <CardContent className="text-3xl font-bold mb-2">{totalSlots}</CardContent>
              <div className="text-sm opacity-90">Créneaux totaux</div>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl">
              <CardContent className="text-3xl font-bold mb-2">{congeSlots}</CardContent>
              <div className="text-sm opacity-90">Congés</div>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl">
              <CardContent className="text-3xl font-bold mb-2">{reunionSlots}</CardContent>
              <div className="text-sm opacity-90">Réunions</div>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
              <CardContent className="text-3xl font-bold mb-2">{autreSlots}</CardContent>
              <div className="text-sm opacity-90">Autres</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => setSelectedTab('toutes')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${selectedTab === 'toutes'
                  ? 'bg-[#06668C] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Toutes ({totalSlots})
            </Button>
            <Button
              onClick={() => setSelectedTab('CONGE')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${selectedTab === 'CONGE'
                  ? 'bg-[#06668C] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Congés ({congeSlots})
            </Button>
            <Button
              onClick={() => setSelectedTab('REUNION_HEBDOMADAIRE')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${selectedTab === 'REUNION_HEBDOMADAIRE'
                  ? 'bg-[#06668C] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Réunions ({reunionSlots})
            </Button>
            <Button
              onClick={() => setSelectedTab('AUTRE')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${selectedTab === 'AUTRE'
                  ? 'bg-[#06668C] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Autres ({autreSlots})
            </Button>
          </div>
        </div>
      </section>

      {/* Modal for Adding/Editing */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-2/5 rounded-xl bg-white shadow-2xl border border-gray-200">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Modifier l\'indisponibilité' : 'Ajouter une indisponibilité'}
              </DialogTitle>
            </DialogHeader>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Type</label>
                <Select
                  value={formData.type_indisponibilite}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type_indisponibilite: value as any })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONGE">Congé</SelectItem>
                    <SelectItem value="REUNION_HEBDOMADAIRE">Réunion Hebdomadaire</SelectItem>
                    <SelectItem value="AUTRE">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Date de début</label>
                <Input
                  type="datetime-local"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Date de fin</label>
                <Input
                  type="datetime-local"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Description {formData.type_indisponibilite === 'AUTRE' && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  required={formData.type_indisponibilite === 'AUTRE'}
                ></textarea>
              </div>
              <DialogFooter className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                    setEditingId(null);
                    setFormData({
                      id_employe: employeId!,
                      type_indisponibilite: 'CONGE',
                      date_debut: '',
                      date_fin: '',
                      description: '',
                    });
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={createIndisponibilite.isLoading || updateIndisponibilite.isLoading}>
                  {editingId ? 'Modifier' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-md rounded-xl bg-white shadow-2xl border border-gray-200">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment supprimer cette indisponibilité ?
            </p>
            <DialogFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteIndisponibilite.isLoading}
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Indisponibilites List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-right">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#06668C] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Ajouter un créneau
            </Button>
          </div>
          {getFilteredIndisponibilites().length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucune indisponibilité trouvée</h3>
              <p className="text-gray-600 mb-8">
                {selectedTab === 'toutes'
                  ? 'Vous n\'avez aucune indisponibilité pour le moment.'
                  : `Aucune indisponibilité de type ${selectedTab === 'CONGE'
                    ? 'congé'
                    : selectedTab === 'REUNION_HEBDOMADAIRE'
                      ? 'réunion hebdomadaire'
                      : 'autre'
                  } trouvée.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {getFilteredIndisponibilites().map((indisponibilite) => (
                <Card
                  key={indisponibilite.id_indisponibilite}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {formatDateTime(indisponibilite.date_debut)} -{' '}
                        {formatDateTime(indisponibilite.date_fin)}
                      </h3>
                      {getStatusBadge(indisponibilite.type_indisponibilite)}
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Description:</span>
                        <div className="font-medium">{indisponibilite.description || 'Aucune'}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleEdit(indisponibilite)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200"
                      >
                        Modifier
                      </Button>
                      <Button
                        onClick={() => openDeleteModal(indisponibilite.id_indisponibilite)}
                        className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-600 hover:text-red-600"
                      >
                        🗑️
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Indisponibilite;