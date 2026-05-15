# TechCruce

TechCruce es una aplicación full stack orientada al scraping, centralización y monitoreo de precios de productos informáticos.

El objetivo del proyecto es obtener productos desde distintas tiendas online, almacenar su información, permitir que los usuarios consulten productos, los agreguen a favoritos y reciban una notificación por email cuando se detecte una baja de precio.

## Descripción

La aplicación permite centralizar productos informáticos de diferentes páginas en un solo lugar. Cada producto puede incluir datos como nombre, precio actual, tienda, categoría, imagen, URL original, estado de disponibilidad e historial de precios.

El sistema está pensado para que los usuarios puedan hacer seguimiento de productos de interés, como notebooks, procesadores, placas de video, memorias RAM, monitores, teclados, mouses y discos SSD.

El backend está desarrollado con NestJS y PostgreSQL, siguiendo una arquitectura modular y separada por responsabilidades. La autenticación se implementa mediante JWT almacenado en cookies HttpOnly.

## Funcionalidades principales

- Scraping de productos informáticos desde tiendas online.
- Centralización de productos en una base de datos relacional.
- Listado y búsqueda de productos.
- Filtrado por categoría, tienda y estado.
- Registro e inicio de sesión de usuarios.
- Autenticación mediante JWT.
- Gestión de favoritos por usuario.
- Historial de precios por producto.
- Detección automática de baja de precio.
- Envío de alertas por email.

## Stack tecnológico

### Backend

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- Bcrypt
- Resend
- Cheerio
- Class Validator
- Class Transformer

### Frontend

- React
- TypeScript
- Vite
- Fetch API
- TanStack Query
