import './ActivityTag.css'

function ActivityTag({ contractType, desligado = false }) {
  if (desligado) {
    return (
      <span className="activity-tag activity-tag--desligado">Desligado</span>
    )
  }
  if (contractType === 'Freelancer') {
    return (
      <span className="activity-tag activity-tag--freelancer">
        Freelancer
      </span>
    )
  }
  if (contractType === 'Consultor') {
    return (
      <span className="activity-tag activity-tag--consultor">Consultor</span>
    )
  }
  if (contractType === 'Desligado') {
    return (
      <span className="activity-tag activity-tag--desligado">Desligado</span>
    )
  }
  return null
}

export default ActivityTag
