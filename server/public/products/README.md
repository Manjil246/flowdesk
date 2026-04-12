# Product images

Filenames are defined in `src/constants/product-image-map.ts` (sku → file name).

Add JPEG/PNG files under this folder to match those names (e.g. `KURTA-01.jpg`).

## WhatsApp

Meta loads `image.link` from your **`BACKEND_BASE_URL`** + `/products/{file}`. Use a **public HTTPS** origin (e.g. deployed API or ngrok) so image sends work.
