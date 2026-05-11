import { useCallback, useMemo, useState } from "react";

import AuthDialog from "../../components/auth/AuthDialog";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import StatusPanel from "../../components/common/StatusPanel";
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import Subnav from "../../components/layout/Subnav";
import ProductDetailView from "../../components/products/ProductDetailView";
import ProductGrid from "../../components/products/ProductGrid";
import ProductsPagination from "../../components/products/ProductsPagination";
import ProductsToolbar from "../../components/products/ProductsToolbar";
import { useAuth } from "../../hooks/auth/useAuth";
import { useFavorites } from "../../hooks/favorites/useFavorites";
import { useProductDetail } from "../../hooks/products/useProductDetail";
import { useProducts } from "../../hooks/products/useProducts";
import type { AuthUser } from "../../types/auth/auth";
import type { SortBy } from "../../types/products/product";
import styles from "./Home.module.css";

type ViewMode = "catalog" | "favorites";

const PAGE_SIZE = 12;
const STORES = ["FullH4rd", "Gezatek"] as const;
const SORT_OPTIONS: Array<{ label: string; value: SortBy }> = [
  { label: "Nombre", value: "name" },
  { label: "Menor precio", value: "priceAsc" },
  { label: "Mayor precio", value: "priceDesc" },
  { label: "Mas recientes", value: "updatedAt" },
];

function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>("catalog");
  const {
    currentUser,
    authModalMode,
    authErrorMessage,
    openAuthModal,
    closeAuthModal,
    changeAuthMode,
    completeAuth,
    refreshCurrentUser,
    signOut: signOutUser,
  } = useAuth();
  const {
    products,
    sortBy,
    searchInput,
    selectedStore,
    pageNumber,
    totalPages,
    totalElements,
    isLoadingProducts,
    productsErrorMessage,
    changeSearch,
    submitSearch,
    changeSort,
    toggleStore,
    goToPreviousPage,
    goToNextPage,
  } = useProducts({ pageSize: PAGE_SIZE });
  const handleAuthRequired = useCallback(() => {
    openAuthModal("sign-in");
  }, [openAuthModal]);

  const {
    favorites,
    favoriteProductIds,
    favoritePendingId,
    isLoadingFavorites,
    favoritesErrorMessage,
    resetFavorites,
    toggleFavorite,
  } = useFavorites({
    currentUser,
    onAuthRequired: handleAuthRequired,
    ensureCurrentUser: refreshCurrentUser,
  });

  const handleAuthSuccess = useCallback(
    (user: AuthUser) => {
      completeAuth(user);
      setViewMode("catalog");
    },
    [completeAuth],
  );

  const handleSignOut = useCallback(async () => {
    const didSignOut = await signOutUser();

    if (didSignOut) {
      resetFavorites();
      setViewMode("catalog");
    }
  }, [resetFavorites, signOutUser]);

  const handleStoreChange = useCallback(
    (store: string) => {
      toggleStore(store);
      setViewMode("catalog");
    },
    [toggleStore],
  );

  const handleSortChange = useCallback(
    (value: SortBy) => {
      changeSort(value);
    },
    [changeSort],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      changeSearch(value);
      setViewMode("catalog");
    },
    [changeSearch],
  );

  const handleSearchSubmit = useCallback(() => {
    submitSearch();
    setViewMode("catalog");
  }, [submitSearch]);

  const handleOpenCatalog = useCallback(() => {
    setViewMode("catalog");
  }, []);

  const handleOpenFavorites = useCallback(() => {
    if (!currentUser) {
      handleAuthRequired();
      return;
    }

    setViewMode("favorites");
  }, [currentUser, handleAuthRequired]);

  const displayedProducts = useMemo(
    () =>
      viewMode === "favorites"
        ? favorites.map((favorite) => favorite.product)
        : products,
    [favorites, products, viewMode],
  );
  const knownProducts = useMemo(() => {
    const uniqueProducts = new Map(
      products.map((product) => [product.id, product]),
    );

    for (const favorite of favorites) {
      uniqueProducts.set(favorite.product.id, favorite.product);
    }

    return [...uniqueProducts.values()];
  }, [favorites, products]);
  const {
    activeProduct,
    isProductDetailOpen,
    isLoadingProductDetail,
    productDetailErrorMessage,
    openProductDetail,
    closeProductDetail,
  } = useProductDetail(knownProducts);

  const subtitle = useMemo(
    () =>
      viewMode === "favorites"
        ? `${favorites.length} productos guardados`
        : `${totalElements} resultados en el catalogo`,
    [favorites.length, totalElements, viewMode],
  );

  const pageError =
    authErrorMessage ||
    favoritesErrorMessage ||
    productsErrorMessage ||
    productDetailErrorMessage;

  return (
    <div className={styles.shell}>
      <Navbar
        currentUser={currentUser}
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onOpenCatalog={handleOpenCatalog}
        onOpenAuth={openAuthModal}
        onSignOut={handleSignOut}
      />

      <Subnav
        viewMode={viewMode}
        onOpenCatalog={handleOpenCatalog}
        onOpenFavorites={handleOpenFavorites}
      />

      <main className={styles.page}>
        <ErrorMessage message={pageError} />

        {isProductDetailOpen && activeProduct ? (
          <ProductDetailView
            product={activeProduct}
            isFavorite={favoriteProductIds.has(activeProduct.id)}
            isPendingFavorite={favoritePendingId === activeProduct.id}
            onBack={closeProductDetail}
            onToggleFavorite={toggleFavorite}
          />
        ) : isProductDetailOpen && isLoadingProductDetail ? (
          <StatusPanel message="Cargando detalle del producto..." />
        ) : viewMode === "favorites" && !currentUser ? (
          <EmptyState
            title="Necesitas iniciar sesion"
            description="Tu cuenta se usa solo para guardar y recuperar favoritos."
            action={
              <button
                type="button"
                className="primary-button"
                onClick={() => openAuthModal("sign-in")}
              >
                Iniciar sesion
              </button>
            }
          />
        ) : isProductDetailOpen ? (
          <EmptyState
            title="No pudimos reconstruir ese producto"
            description="Vuelve al catalogo para abrirlo otra vez desde la lista."
            action={
              <button
                type="button"
                className="primary-button"
                onClick={closeProductDetail}
              >
                Volver al catalogo
              </button>
            }
          />
        ) : isLoadingProducts ||
          (viewMode === "favorites" && isLoadingFavorites) ? (
          <>
            <ProductsToolbar
              id="catalogo"
              viewMode={viewMode}
              subtitle={subtitle}
              stores={STORES}
              selectedStore={selectedStore}
              sortBy={sortBy}
              sortOptions={SORT_OPTIONS}
              onStoreChange={handleStoreChange}
              onSortChange={handleSortChange}
            />
            <StatusPanel message="Cargando catalogo..." />
          </>
        ) : (
          <>
            <ProductsToolbar
              id="catalogo"
              viewMode={viewMode}
              subtitle={subtitle}
              stores={STORES}
              selectedStore={selectedStore}
              sortBy={sortBy}
              sortOptions={SORT_OPTIONS}
              onStoreChange={handleStoreChange}
              onSortChange={handleSortChange}
            />

            {displayedProducts.length === 0 ? (
              <EmptyState
                title={
                  viewMode === "favorites"
                    ? "Todavia no guardaste favoritos"
                    : "No encontramos productos con esos filtros"
                }
                description={
                  viewMode === "favorites"
                    ? "Cuando marques un producto con el corazon, aparecera en esta seccion."
                    : "Prueba otra busqueda o cambia la tienda seleccionada."
                }
              />
            ) : (
              <>
                <ProductGrid
                  products={displayedProducts}
                  favoriteProductIds={favoriteProductIds}
                  favoritePendingId={favoritePendingId}
                  onOpenDetail={openProductDetail}
                  onToggleFavorite={toggleFavorite}
                />

                {viewMode === "catalog" ? (
                  <ProductsPagination
                    pageNumber={pageNumber}
                    totalPages={totalPages}
                    onPrevious={goToPreviousPage}
                    onNext={goToNextPage}
                  />
                ) : null}
              </>
            )}
          </>
        )}
      </main>

      <Footer onOpenFavorites={handleOpenFavorites} />

      {authModalMode ? (
        <AuthDialog
          mode={authModalMode}
          externalErrorMessage={authErrorMessage}
          onClose={closeAuthModal}
          onModeChange={changeAuthMode}
          onSuccess={handleAuthSuccess}
        />
      ) : null}
    </div>
  );
}

export default Home;
