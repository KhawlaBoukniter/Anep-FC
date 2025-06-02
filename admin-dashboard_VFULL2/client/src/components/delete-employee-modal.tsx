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

interface DeleteEmployeeModalProps {
  employeeId: string
  employeeName: string
}

export function DeleteEmployeeModal({ employeeId, employeeName }: DeleteEmployeeModalProps) {
  const [open, setOpen] = useState(false)

  const handleDelete = () => {
    console.log("Suppression de l'employé:", employeeId)
    alert(`Employé ${employeeName} supprimé avec succès!`)
    setOpen(false)
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
                Êtes-vous sûr de vouloir supprimer l'employé <strong>{employeeName}</strong> ?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées à cet employé
            seront définitivement supprimées.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
