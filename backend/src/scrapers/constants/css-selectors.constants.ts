export const FULLH4RD_SELECTORS = {
  productList: '.product-list',
  title: '.info > h3',
  price: '.price',
  image: 'a > div > img',
  link: 'a',
  nextPage: 'a[rel=next]',
} as const;

export const GEZATEK_SELECTORS = {
  title: 'h4.card-title a',
  price: 'h4[data-precio]',
  priceAttribute: 'data-precio',
  image: 'img.img-fluid',
  link: 'div.view.overlay.imagen a, h4.card-title a',
  productList: 'div[class*=item], div.card, div.producto, article',
} as const;
