import RadioListModal from './RadioListModal.jsx'

const PAYMENT_TYPES = ['Mensal', 'Anual', 'Valor fixo']

function PagamentoModal({ value, onSave, onClose }) {
  return (
    <RadioListModal
      title="Pagamento"
      options={PAYMENT_TYPES}
      value={value}
      onSave={onSave}
      onClose={onClose}
    />
  )
}

export default PagamentoModal
