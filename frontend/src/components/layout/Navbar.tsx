import { LogOut, Search, UserRound } from 'lucide-react'

import type { AuthMode } from '../auth/AuthDialog'
import type { AuthUser } from '../../types/auth/auth'
import styles from './Navbar.module.css'

interface NavbarProps {
  currentUser: AuthUser | null
  searchValue: string
  onSearchChange: (value: string) => void
  onSearchSubmit: () => void
  onOpenCatalog: () => void
  onOpenAuth: (mode: AuthMode) => void
  onSignOut: () => void
}

function Navbar({
  currentUser,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onOpenCatalog,
  onOpenAuth,
  onSignOut,
}: NavbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.inner}>
        <button type="button" className={styles.brand} onClick={onOpenCatalog}>
          <span className={styles.brandText}>
            <strong>TechCruce</strong>
          </span>
        </button>

        <label className={styles.searchbox}>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSearchSubmit()
              }
            }}
            placeholder="Buscar productos, marcas o tiendas"
          />
          <button
            type="button"
            className={styles.searchButton}
            onClick={onSearchSubmit}
            aria-label="Buscar productos"
          >
            <Search size={18} />
          </button>
        </label>

        <div className={styles.actions}>
          {currentUser ? (
            <div className={styles.accountActions}>
              <div className={styles.identityChip}>
                <UserRound size={18} />
                <span>{currentUser.name || currentUser.email}</span>
              </div>
              <button type="button" className="secondary-button" onClick={onSignOut}>
                <LogOut size={16} />
                Cerrar sesion
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <button
                type="button"
                className="ghost-button"
                onClick={() => onOpenAuth('sign-in')}
              >
                Iniciar sesion
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => onOpenAuth('sign-up')}
              >
                Crear cuenta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
