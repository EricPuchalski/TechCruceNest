-- Add a PostgreSQL full-text search index similar to the Mongo text index on name + store.
CREATE INDEX "products_name_store_search_idx"
ON "products"
USING GIN (to_tsvector('simple', coalesce("name", '') || ' ' || coalesce("store", '')));
