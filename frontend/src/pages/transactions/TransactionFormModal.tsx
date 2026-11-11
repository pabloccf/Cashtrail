import { useState } from 'react'
import Modal from '../../components/Modal'
import TransactionForm from '../../components/TransactionForm'
import {
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from '../../hooks/useTransactionMutations'
import type { Transaction, TransactionInput } from '../../types/transaction'
import { getErrorMessage } from '../../utils/errorMessage'

interface TransactionFormModalProps {
  // Present when editing, missing when creating
  transaction?: Transaction
  onClose: () => void
}

// Connects the form with the mutations: the form itself knows nothing about the API
function TransactionFormModal({ transaction, onClose }: TransactionFormModalProps) {
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const saveMutation = transaction ? updateMutation : createMutation

  function handleSubmit(input: TransactionInput) {
    if (transaction) {
      updateMutation.mutate({ id: transaction.id, input }, { onSuccess: onClose })
    } else {
      createMutation.mutate(input, { onSuccess: onClose })
    }
  }

  function handleDelete() {
    if (!transaction) return
    deleteMutation.mutate(transaction.id, { onSuccess: onClose })
  }

  return (
    <Modal title={transaction ? 'Editar transacción' : 'Nueva transacción'} onClose={onClose}>
      <TransactionForm
        transaction={transaction}
        isSubmitting={saveMutation.isPending}
        submitError={saveMutation.isError ? getErrorMessage(saveMutation.error) : undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />

      {transaction && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          {isConfirmingDelete ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-700">¿Seguro que quieres eliminar esta transacción? No se puede deshacer.</p>
              {deleteMutation.isError && (
                <p className="text-sm text-rose-600" role="alert">
                  {getErrorMessage(deleteMutation.error)}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="min-h-11 rounded-lg px-4 font-medium text-slate-600 hover:bg-slate-100"
                >
                  No, mantener
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="min-h-11 rounded-lg bg-rose-600 px-4 font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="min-h-11 rounded-lg px-4 font-medium text-rose-600 hover:bg-rose-50"
            >
              Eliminar transacción
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}

export default TransactionFormModal
