import {
  startTransition,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { fetchProducts } from '../../services/products/products.service'
import { getErrorMessage, isAbortError } from '../../utils/ui'
import type { Product, SortBy } from '../../types/products/product'

interface UseProductsOptions {
  pageSize?: number
}

export function useProducts({ pageSize = 12 }: UseProductsOptions = {}) {
  const SEARCH_DEBOUNCE_MS = 3000
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState('')
  const [pageNumber, setPageNumber] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      setIsLoadingProducts(true)

      try {
        const response = await fetchProducts(
          {
            pageNumber,
            size: pageSize,
            store: selectedStore,
            search: debouncedSearch,
            sortBy,
          },
          { signal: controller.signal },
        )

        setProducts(response.data)
        setTotalPages(response.pagination.totalPages)
        setTotalElements(response.pagination.totalElements)
        setErrorMessage('')
      } catch (error) {
        if (isAbortError(error)) {
          return
        }

        setErrorMessage(getErrorMessage(error))
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false)
        }
      }
    }

    void loadProducts()

    return () => {
      controller.abort()
    }
  }, [debouncedSearch, pageNumber, pageSize, selectedStore, sortBy])

  const toggleStore = useCallback((store: string) => {
    setIsLoadingProducts(true)

    startTransition(() => {
      setSelectedStore((currentStore) => (currentStore === store ? '' : store))
      setPageNumber(0)
    })
  }, [])

  const changeSort = useCallback((value: SortBy) => {
    setIsLoadingProducts(true)

    startTransition(() => {
      setSortBy(value)
      setPageNumber(0)
    })
  }, [])

  const changeSearch = useCallback((value: string) => {
    setSearchInput(value)

    startTransition(() => {
      setPageNumber(0)
    })
  }, [])

  const submitSearch = useCallback(() => {
    setDebouncedSearch(searchInput.trim())
    setPageNumber(0)
  }, [searchInput])

  const goToPreviousPage = useCallback(() => {
    setIsLoadingProducts(true)
    setPageNumber((currentPage) => Math.max(currentPage - 1, 0))
  }, [])

  const goToNextPage = useCallback(() => {
    setIsLoadingProducts(true)
    setPageNumber((currentPage) =>
      totalPages === 0 ? currentPage : Math.min(currentPage + 1, totalPages - 1),
    )
  }, [totalPages])

  return {
    products,
    sortBy,
    searchInput,
    selectedStore,
    pageNumber,
    totalPages,
    totalElements,
    isLoadingProducts,
    productsErrorMessage: errorMessage,
    changeSearch,
    submitSearch,
    changeSort,
    toggleStore,
    goToPreviousPage,
    goToNextPage,
  }
}
