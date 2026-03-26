---
name: Chunko Bold no soporta tildes
description: La fuente Chunko Bold no renderiza bien los caracteres con tilde/acento. Usar Now Bold para títulos grandes con tildes.
type: feedback
---

Chunko Bold no tiene soporte correcto para caracteres acentuados (á, é, í, ó, ú, ñ). En títulos grandes queda roto visualmente.

**Why:** Se comprobó en producción al usar Chunko con "Presúmelo" — el acento no se renderiza bien.

**How to apply:** Para títulos/headings grandes en Chunko, evitar palabras con tildes. Si el texto necesita tilde, usar `font-['Now'] font-black` en su lugar. Chunko solo para palabras sin acentos (PACO, MERLOS, FRESCOS, VITRINA, etc.).
