import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import CategoryBadge from './CategoryBadge'
import Modal from './Modal'
import { useConfirmTransaction } from '../hooks/useTransactionMutations'
import type { Transaction } from '../types/transaction'
import { formatDate } from '../utils/date'
import { getErrorMessage } from '../utils/errorMessage'
import { centsToInput, parseAmountToCents } from '../utils/money'
import { useMoney } from '../hooks/useMoney'

const confirmFormSchema = z.object({
  amount: z.string().refine((value) => {
    const cents = parseAmountToCents(value)
    return cents !== null && cents > 0
  }, 'Introduce un importe válido'),
})

type ConfirmFormValues = z.infer<typeof confirmFormSchema>

interface ConfirmTransactionModalProps {
  transaction: Transaction
  onClose: () => void
}

// Confirms a pending record (from a recurring transaction in "ask for confirmation" mode).
// The amount comes filled in with the expected one and can be adjusted to the real one
function ConfirmTransactionModal({ transaction, onClose }: ConfirmTransactionModalProps) {
  const { symbol } = useMoney()
  const confirmMutation = useConfirmTransaction()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmFormValues>({
    resolver: zodResolver(confirmFormSchema),
    defaultValues: { amount: centsToInput(transaction.amount) },
  })

  function submit(values: ConfirmFormValues) {
    const amount = parseAmountToCents(values.amount)
    if (amount === null) return // Cannot happen: the schema already checked it
    // Only sent when it changed: without it, the backend keeps the current amount
    const adjustedAmount = amount === transaction.amount ? undefined : amount
    confirmMutation.mutate({ id: transaction.id, amount: adjustedAmount }, { onSuccess: onClose })
  }

  return (
    <Modal title="Confirmar registro" onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-medium">{transaction.description || transaction.category.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <CategoryBadge category={transaction.category} />
            <span className="text-sm text-slate-500">{formatDate(transaction.date)}</span>
          </div>
        </div>

        <div>
          <label htmlFor="confirm-amount" className="mb-1 block text-sm font-medium">
            Importe ({symbol})
          </label>
          <input
            id="confirm-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none aria-invalid:border-rose-500"
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby="confirm-amount-hint"
            {...register('amount')}
          />
          {errors.amount?.message ? (
            <p className="mt-1 text-sm text-rose-600">{errors.amount.message}</p>
          ) : (
            <p id="confirm-amount-hint" className="mt-1 text-sm text-slate-500">
              Ajústalo si el importe real es distinto.
            </p>
          )}
        </div>

        {confirmMutation.isError && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            {getErrorMessage(confirmMutation.error)}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg px-4 font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={confirmMutation.isPending}
            className="min-h-11 rounded-lg bg-emerald-600 px-5 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {confirmMutation.isPending ? 'Confirmando…' : 'Confirmar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ConfirmTransactionModal
