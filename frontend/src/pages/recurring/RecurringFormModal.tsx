import Modal from '../../components/Modal'
import RecurringForm from '../../components/RecurringForm'
import { useCreateRecurring, useUpdateRecurring } from '../../hooks/useRecurringMutations'
import type { TransactionType } from '../../types/transaction'
import type { RecurringInput, RecurringTransaction } from '../../types/recurring'
import { getErrorMessage } from '../../utils/errorMessage'

interface RecurringFormModalProps {
  // Present when editing, missing when creating
  recurring?: RecurringTransaction
  defaultType: TransactionType
  onClose: () => void
}

// Connects the form with the mutations: the form itself knows nothing about the API
function RecurringFormModal({ recurring, defaultType, onClose }: RecurringFormModalProps) {
  const createMutation = useCreateRecurring()
  const updateMutation = useUpdateRecurring()

  const saveMutation = recurring ? updateMutation : createMutation

  function handleSubmit(input: RecurringInput) {
    if (recurring) {
      updateMutation.mutate({ id: recurring.id, input }, { onSuccess: onClose })
    } else {
      createMutation.mutate(input, { onSuccess: onClose })
    }
  }

  return (
    <Modal title={recurring ? 'Editar fijo' : 'Nuevo fijo'} onClose={onClose}>
      <RecurringForm
        recurring={recurring}
        defaultType={defaultType}
        isSubmitting={saveMutation.isPending}
        submitError={saveMutation.isError ? getErrorMessage(saveMutation.error) : undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}

export default RecurringFormModal
