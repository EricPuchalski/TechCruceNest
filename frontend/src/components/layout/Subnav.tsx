import styles from './Subnav.module.css'

type ViewMode = 'catalog' | 'favorites'

interface SubnavProps {
  viewMode: ViewMode
  onOpenCatalog: () => void
  onOpenFavorites: () => void
}

function Subnav({ viewMode, onOpenCatalog, onOpenFavorites }: SubnavProps) {
  return (
    <nav className={styles.subnav} aria-label="Secciones principales">
      <button
        type="button"
        className={`${styles.link} ${viewMode === 'catalog' ? styles.active : ''}`}
        onClick={onOpenCatalog}
      >
        Inicio
      </button>
      <button
        type="button"
        className={`${styles.link} ${viewMode === 'favorites' ? styles.active : ''}`}
        onClick={onOpenFavorites}
      >
        Favoritos
      </button>
    </nav>
  )
}

export default Subnav
