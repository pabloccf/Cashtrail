import Modal from '../../components/Modal'
import TransactionForm from '../../components/TransactionForm'
import { useCreateTransaction, useUpdateTransaction } from '../../hooks/useTransactionMutations'
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

  const saveMutation = transaction ? updateMutation : createMutation

  function handleSubmit(input: TransactionInput) {
    if (transaction) {
      updateMutation.mutate({ id: transaction.id, input }, { onSuccess: onClose })
    } else {
      createMutation.mutate(input, { onSuccess: onClose })
    }
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
    </Modal>
  )
}

export default TransactionFormModal
