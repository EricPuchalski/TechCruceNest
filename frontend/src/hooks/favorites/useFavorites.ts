import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  addFavorite,
  fetchFavorites,
  removeFavorite,
} from '../../services/favorites/favorites.service'
import { getErrorMessage, isAbortError } from '../../utils/ui'
import type { AuthUser } from '../../types/auth/auth'
import type { Favorite } from '../../types/favorites/favorite'
import type { Product } from '../../types/products/product'

interface UseFavoritesOptions {
  currentUser: AuthUser | null
  onAuthRequired: () => void
  ensureCurrentUser: () => Promise<AuthUser | null>
}

export function useFavorites({
  currentUser,
  onAuthRequired,
  ensureCurrentUser,
}: UseFavoritesOptions) {
  const currentUserId = currentUser?.id ?? ''
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [lastLoadedUserId, setLastLoadedUserId] = useState('')
  const [favoritePendingId, setFavoritePendingId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const isLoadingFavorites = Boolean(currentUserId) && lastLoadedUserId !== currentUserId
  const visibleFavorites = useMemo(
    () => (currentUserId === lastLoadedUserId ? favorites : []),
    [currentUserId, favorites, lastLoadedUserId],
  )

  const favoriteProductIds = useMemo(
    () => new Set(visibleFavorites.map((favorite) => favorite.product.id)),
    [visibleFavorites],
  )

  useEffect(() => {
    if (!currentUserId) {
      return
    }

    const controller = new AbortController()

    async function loadFavorites() {
      try {
        const response = await fetchFavorites({ signal: controller.signal })
        setFavorites(response.data)
        setErrorMessage('')
      } catch (error) {
        if (isAbortError(error)) {
          return
        }

        setErrorMessage(getErrorMessage(error))
      } finally {
        if (!controller.signal.aborted) {
          setLastLoadedUserId(currentUserId)
        }
      }
    }

    void loadFavorites()

    return () => {
      controller.abort()
    }
  }, [currentUserId])

  const toggleFavorite = useCallback(
    async (product: Product) => {
      let authenticatedUserId = currentUserId

      if (!authenticatedUserId) {
        const refreshedUser = await ensureCurrentUser()

        if (refreshedUser) {
          authenticatedUserId = refreshedUser.id
        }
      }

      if (!authenticatedUserId) {
        onAuthRequired()
        return false
      }

      setFavoritePendingId(product.id)

      try {
        if (favoriteProductIds.has(product.id)) {
          await removeFavorite(product.id)
          setFavorites((currentFavorites) =>
            currentFavorites.filter((favorite) => favorite.product.id !== product.id),
          )
        } else {
          const response = await addFavorite(product.id)
          setFavorites((currentFavorites) => [response.data, ...currentFavorites])
        }

        setErrorMessage('')
        return true
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
        return false
      } finally {
        setFavoritePendingId('')
      }
    },
    [currentUserId, ensureCurrentUser, favoriteProductIds, onAuthRequired],
  )

  const resetFavorites = useCallback(() => {
    setFavorites([])
    setLastLoadedUserId('')
    setFavoritePendingId('')
    setErrorMessage('')
  }, [])

  return {
    favorites: visibleFavorites,
    favoriteProductIds,
    favoritePendingId,
    isLoadingFavorites,
    favoritesErrorMessage: errorMessage,
    resetFavorites,
    toggleFavorite,
  }
}
