'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, X } from 'lucide-react'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  itemName?: string
  isDeleting?: boolean
  type?: 'organization' | 'person' | 'meeting' | 'relationship_manager'
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isDeleting = false,
  type
}: DeleteConfirmationDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  
  if (!isOpen) return null

  const requiresTextConfirmation = type === 'organization'
  const expectedText = 'DELETE'
  const canConfirm = requiresTextConfirmation ? confirmText === expectedText : true

  const getWarningMessage = () => {
    switch (type) {
      case 'organization':
        return 'This will also delete all associated people and meetings. This action cannot be undone.'
      case 'person':
        return 'This will remove all meeting associations. This action cannot be undone.'
      case 'meeting':
        return 'This will permanently delete the meeting record. This action cannot be undone.'
      default:
        return 'This action cannot be undone.'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 mb-2">{description}</p>
            {itemName && (
              <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded">
                {itemName}
              </p>
            )}
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Warning</h4>
                <p className="text-sm text-red-700">{getWarningMessage()}</p>
              </div>
            </div>
          </div>

          {requiresTextConfirmation && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono bg-gray-100 px-1 rounded">{expectedText}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={`Type ${expectedText} to confirm`}
                disabled={isDeleting}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={!canConfirm || isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}