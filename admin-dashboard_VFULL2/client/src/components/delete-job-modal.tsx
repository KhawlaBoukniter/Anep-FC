"use client"

import { useState } from "react"
import { Button } from "./ui/button.tsx"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog.tsx"
import { Trash2, AlertTriangle } from "lucide-react"
import { useDeleteJob } from "../hooks/useJobs" 
import { useQueryClient } from "react-query"

interface DeleteJobModalProps {
  jobId: string
  jobCode: string
}

export function DeleteJobModal({ jobId, jobCode }: DeleteJobModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const deleteJobMutation = useDeleteJob()

  const handleDelete = () => {
    deleteJobMutation.mutate(jobId, {
      onSuccess: () => {
        setOpen(false)
      },
      onError: (error: any) => {
        console.error("Erreur lors de la suppression de l'emploi:", error)
        alert(error.response?.data?.error || "Erreur lors de la suppression de l'emploi")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription className="mt-2">
                Êtes-vous sûr de vouloir supprimer l'emploi <strong>{jobCode}</strong> ?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées à cet emploi seront
            définitivement supprimées.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteJobMutation.isLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteJobMutation.isLoading ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}