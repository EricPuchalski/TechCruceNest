import { useCallback, useEffect, useState } from 'react'

import type { AuthMode } from '../../components/auth/AuthDialog'
import { fetchCurrentUser, signOut } from '../../services/auth/auth.service'
import { getErrorMessage, isAbortError } from '../../utils/ui'
import type { AuthUser } from '../../types/auth/auth'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  GOOGLE_ACCOUNT_CONFLICT:
    'Ya existe una cuenta con ese email. Inicia sesion con email y contraseña para continuar.',
  GOOGLE_AUTHENTICATION_FAILED:
    'No pudimos completar el inicio de sesion con Google. Intentalo nuevamente.',
  GOOGLE_AUTH_NOT_CONFIGURED:
    'El inicio de sesion con Google todavia no esta configurado.',
}

function getInitialAuthRedirectState() {
  const params = new URLSearchParams(window.location.search)
  const authError = params.get('auth_error')

  if (!authError) {
    return { hasError: false, message: '' }
  }

  return {
    hasError: true,
    message:
      AUTH_ERROR_MESSAGES[authError] ??
      'No pudimos completar el inicio de sesion. Intentalo nuevamente.',
  }
}

export function useAuth() {
  const [authRedirectState] = useState(getInitialAuthRedirectState)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [authModalMode, setAuthModalMode] = useState<AuthMode | null>(() =>
    authRedirectState.hasError ? 'sign-in' : null,
  )
  const [errorMessage, setErrorMessage] = useState(authRedirectState.message)

  const refreshCurrentUser = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetchCurrentUser({ signal })
        setCurrentUser(response.user)
        return response.user
      } catch (error) {
        if (isAbortError(error)) {
          return null
        }

        setCurrentUser(null)
        return null
      }
    },
    [],
  )

  useEffect(() => {
    const controller = new AbortController()

    async function bootstrap() {
      await refreshCurrentUser(controller.signal)
    }

    void bootstrap()

    return () => {
      controller.abort()
    }
  }, [refreshCurrentUser])

  useEffect(() => {
    if (!authRedirectState.hasError) {
      return
    }

    const params = new URLSearchParams(window.location.search)
    params.delete('auth_error')
    const nextSearch = params.toString()
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`
    window.history.replaceState({}, '', nextUrl)
  }, [authRedirectState.hasError])

  const openAuthModal = useCallback((mode: AuthMode) => {
    setAuthModalMode(mode)
    setErrorMessage('')
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModalMode(null)
    setErrorMessage('')
  }, [])

  const changeAuthMode = useCallback((mode: AuthMode) => {
    setAuthModalMode(mode)
    setErrorMessage('')
  }, [])

  const completeAuth = useCallback((user: AuthUser) => {
    setCurrentUser(user)
    setAuthModalMode(null)
    setErrorMessage('')
  }, [])

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      setCurrentUser(null)
      setErrorMessage('')
      return true
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      return false
    }
  }, [])

  return {
    currentUser,
    authModalMode,
    authErrorMessage: errorMessage,
    openAuthModal,
    closeAuthModal,
    changeAuthMode,
    completeAuth,
    refreshCurrentUser,
    signOut: handleSignOut,
  }
}
