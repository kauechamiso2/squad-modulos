import RadioListModal from './RadioListModal.jsx'

const CONTRACT_TYPES = ['Fixo', 'Freelancer', 'Consultor']

function ContratoModal({ value, onSave, onClose }) {
  return (
    <RadioListModal
      title="Contrato"
      options={CONTRACT_TYPES}
      value={value}
      onSave={onSave}
      onClose={onClose}
    />
  )
}

export default ContratoModal
