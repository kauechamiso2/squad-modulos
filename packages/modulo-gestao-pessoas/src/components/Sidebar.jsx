import './Sidebar.css'

const PLACEHOLDER_COUNT = 5

function Sidebar() {
  return (
    <aside className="sidebar">
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <div className="sidebar__item" key={index} />
      ))}
    </aside>
  )
}

export default Sidebar
