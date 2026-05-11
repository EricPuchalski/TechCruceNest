import { useCallback, useEffect, useMemo, useState } from 'react'

import { getErrorMessage, isAbortError } from '../../utils/ui'
import { fetchProductById } from '../../services/products/products.service'
import type { Product } from '../../types/products/product'

const PRODUCT_ROUTE_PREFIX = '/products/'
const PRODUCT_STORAGE_KEY = 'techcruce:last-product'

function getProductIdFromPath(pathname: string) {
  if (!pathname.startsWith(PRODUCT_ROUTE_PREFIX)) {
    return null
  }

  const rawId = pathname.slice(PRODUCT_ROUTE_PREFIX.length)
  return rawId ? decodeURIComponent(rawId) : null
}

function readStoredProduct(productId: string | null) {
  if (!productId) {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(PRODUCT_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue) as Product
    return parsedValue.id === productId ? parsedValue : null
  } catch {
    return null
  }
}

export function useProductDetail(products: Product[]) {
  const [activeProductId, setActiveProductId] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : getProductIdFromPath(window.location.pathname),
  )
  const [productDetail, setProductDetail] = useState<Product | null>(null)
  const [isLoadingProductDetail, setIsLoadingProductDetail] = useState(false)
  const [productDetailErrorMessage, setProductDetailErrorMessage] = useState('')

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  const activeProduct = useMemo(() => {
    if (!activeProductId) {
      return null
    }

    if (productDetail?.id === activeProductId) {
      return productDetail
    }

    return productsById.get(activeProductId) ?? readStoredProduct(activeProductId)
  }, [activeProductId, productDetail, productsById])

  useEffect(() => {
    function syncFromLocation() {
      setActiveProductId(getProductIdFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', syncFromLocation)

    return () => {
      window.removeEventListener('popstate', syncFromLocation)
    }
  }, [])

  useEffect(() => {
    if (!activeProduct) {
      return
    }

    window.sessionStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(activeProduct))
  }, [activeProduct])

  useEffect(() => {
    if (!activeProductId) {
      setProductDetail(null)
      setIsLoadingProductDetail(false)
      setProductDetailErrorMessage('')
      return
    }

    const productId = activeProductId
    const cachedProduct = productsById.get(productId) ?? readStoredProduct(productId)

    if (!cachedProduct) {
      setProductDetail(null)
    }

    const controller = new AbortController()
    setIsLoadingProductDetail(true)
    setProductDetailErrorMessage('')

    async function loadProductDetail() {
      try {
        const response = await fetchProductById(productId, {
          signal: controller.signal,
        })
        setProductDetail(response)
      } catch (error) {
        if (isAbortError(error)) {
          return
        }

        setProductDetailErrorMessage(getErrorMessage(error))
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProductDetail(false)
        }
      }
    }

    void loadProductDetail()

    return () => {
      controller.abort()
    }
  }, [activeProductId, productsById])

  const openProductDetail = useCallback((product: Product) => {
    const nextPath = `${PRODUCT_ROUTE_PREFIX}${encodeURIComponent(product.id)}`
    window.sessionStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(product))
    window.history.pushState({ productId: product.id }, '', nextPath)
    setActiveProductId(product.id)
  }, [])

  const closeProductDetail = useCallback(() => {
    window.history.pushState({}, '', '/')
    setActiveProductId(null)
    setProductDetail(null)
    setIsLoadingProductDetail(false)
    setProductDetailErrorMessage('')
  }, [])

  return {
    activeProduct,
    isProductDetailOpen: activeProductId !== null,
    isLoadingProductDetail,
    productDetailErrorMessage,
    openProductDetail,
    closeProductDetail,
  }
}
