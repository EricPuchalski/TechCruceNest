import type { SortBy } from '../../types/products/product'
import styles from './ProductsToolbar.module.css'

interface ProductsToolbarProps {
  id?: string
  viewMode: 'catalog' | 'favorites'
  subtitle: string
  stores: readonly string[]
  selectedStore: string
  sortBy: SortBy
  sortOptions: Array<{ label: string; value: SortBy }>
  onStoreChange: (store: string) => void
  onSortChange: (value: SortBy) => void
}

function ProductsToolbar({
  id,
  viewMode,
  subtitle,
  stores,
  selectedStore,
  sortBy,
  sortOptions,
  onStoreChange,
  onSortChange,
}: ProductsToolbarProps) {
  return (
    <section id={id} className={styles.toolbar}>
      <div className={styles.summary}>
        <h2>{viewMode === 'favorites' ? 'Tus favoritos' : 'Listado de productos'}</h2>
        <p>{subtitle}</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.storeFilter} aria-label="Filtrar por tienda">
          {stores.map((store) => (
            <button
              key={store}
              type="button"
              className={`${styles.filterPill} ${selectedStore === store ? styles.filterPillActive : ''}`}
              onClick={() => onStoreChange(store)}
            >
              {store}
            </button>
          ))}
        </div>

        <label className={styles.sortField}>
          <span>Ordenar por</span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as SortBy)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}

export default ProductsToolbar
