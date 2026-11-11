import CategoryIcon from '../../components/CategoryIcon'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useDeleteCategory } from '../../hooks/useCategoryMutations'
import type { Category } from '../../types/category'
import { getCategoryDeleteErrorMessage } from '../../utils/categoryErrors'

interface DeleteCategoryDialogProps {
  category: Category
  onClose: () => void
}

// The frontend does not know in advance whether the category is in use: the backend checks it
// and answers 409 with the counts, which are shown in the dialog's error box
function DeleteCategoryDialog({ category, onClose }: DeleteCategoryDialogProps) {
  const deleteMutation = useDeleteCategory()

  return (
    <ConfirmDialog
      title="¿Eliminar categoría?"
      message={
        <>
          <span className="flex items-center justify-center gap-2 font-medium text-slate-900">
            <CategoryIcon icon={category.icon} color={category.color} />
            {category.name}
          </span>
          <p className="mt-3">Esta acción no se puede deshacer.</p>
        </>
      }
      confirmLabel="Eliminar"
      isConfirming={deleteMutation.isPending}
      error={deleteMutation.isError ? getCategoryDeleteErrorMessage(deleteMutation.error) : undefined}
      onConfirm={() => deleteMutation.mutate(category.id, { onSuccess: onClose })}
      onCancel={onClose}
    />
  )
}

export default DeleteCategoryDialog
