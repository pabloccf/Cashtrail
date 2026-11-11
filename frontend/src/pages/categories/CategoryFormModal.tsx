import CategoryForm from '../../components/CategoryForm'
import Modal from '../../components/Modal'
import { useCreateCategory, useUpdateCategory } from '../../hooks/useCategoryMutations'
import type { Category, CategoryInput } from '../../types/category'
import type { TransactionType } from '../../types/transaction'
import { getCategorySaveErrorMessage } from '../../utils/categoryErrors'

interface CategoryFormModalProps {
  // Present when editing, missing when creating
  category?: Category
  defaultType: TransactionType
  onClose: () => void
}

// Connects the form with the mutations, like TransactionFormModal
function CategoryFormModal({ category, defaultType, onClose }: CategoryFormModalProps) {
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const saveMutation = category ? updateMutation : createMutation

  function handleSubmit(input: CategoryInput) {
    if (category) {
      updateMutation.mutate({ id: category.id, input }, { onSuccess: onClose })
    } else {
      createMutation.mutate(input, { onSuccess: onClose })
    }
  }

  return (
    <Modal title={category ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}>
      <CategoryForm
        category={category}
        defaultType={defaultType}
        isSubmitting={saveMutation.isPending}
        submitError={saveMutation.isError ? getCategorySaveErrorMessage(saveMutation.error) : undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}

export default CategoryFormModal
