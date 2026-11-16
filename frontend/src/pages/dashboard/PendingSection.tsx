import { useState } from 'react'
import CompactTransactionList from '../../components/CompactTransactionList'
import ConfirmTransactionModal from '../../components/ConfirmTransactionModal'
import SectionCard from '../../components/SectionCard'
import { useTransactions } from '../../hooks/useTransactions'
import type { Transaction } from '../../types/transaction'
import { ALL_MONTHS } from '../../utils/transactionFilters'
import SectionError from './SectionError'

// Pending records of any month (not only the one on screen), oldest ones included.
// Hidden when there are none, so it only takes space when there is something to do
function PendingSection() {
  const { data, isError, error, refetch } = useTransactions({ status: 'PENDING', page: 1, pageSize: 10 })
  // The pending record being confirmed, or null if the modal is closed
  const [transactionToConfirm, setTransactionToConfirm] = useState<Transaction | null>(null)

  if (isError) {
    return (
      <SectionCard title="Pendientes de confirmar">
        <SectionError message="No se han podido cargar los pendientes." error={error} onRetry={() => refetch()} />
      </SectionCard>
    )
  }

  // Also while loading: the block appears when there is something to show, instead of a "Cargando…"
  // that would vanish for users without pending records
  const total = data?.pagination.total ?? 0
  if (!data || total === 0) return null

  return (
    <SectionCard
      title={`Pendientes de confirmar (${total})`}
      // Only when there are more than the ones listed here
      link={
        total > data.data.length
          ? { to: `/transactions?status=PENDING&month=${ALL_MONTHS}`, label: 'Ver todos' }
          : undefined
      }
    >
      <CompactTransactionList transactions={data.data} onConfirm={setTransactionToConfirm} />
      {transactionToConfirm && (
        <ConfirmTransactionModal transaction={transactionToConfirm} onClose={() => setTransactionToConfirm(null)} />
      )}
    </SectionCard>
  )
}

export default PendingSection
