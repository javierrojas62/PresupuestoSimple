# 🧾 Presupuesto Simple

Aplicación web 100% frontend para crear presupuestos profesionales y descargarlos en PDF.  
Sin servidores, sin bases de datos — solo abrí el `index.html` y ya podés crear presupuestos.

## ✨ Características

- **Datos de empresa**: nombre, CUIT, email, dirección, teléfono + logo
- **Datos de cliente**: nombre, CUIT, email
- **Tabla dinámica de productos**: agregá y eliminá filas con cálculo automático de subtotales y total
- **Validez del presupuesto**: configurable en días, fechas calculadas automáticamente
- **Notas / descripción**: campo libre para condiciones de pago, garantía, etc.
- **Exportación a PDF**: un click con `html2pdf.js`
- **Diseño responsive**: Bootstrap 5, funciona en celular, tablet y desktop
- **Español y moneda local**: formato `$ 1.234,56`
- **Seguridad básica OWASP**: sanitización de inputs, validación de archivos, CSP

## 🚀 Demo

👉 [Ver demo en GitHub Pages](https://javierrojas62.github.io/presupuesto-simple)

## 📦 Tecnologías

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| HTML5 | — | Estructura |
| CSS3 + Custom Properties | — | Estilos |
| Bootstrap | 5.3.2 | Grid responsive + componentes |
| JavaScript (Vanilla) | ES2020 | Toda la lógica |
| html2pdf.js | 0.10.1 | Generación de PDF |
| Google Fonts (Inter) | — | Tipografía |

## 🛠️ Uso

1. Descargá o cloná el repositorio
2. Abrí `index.html` en tu navegador (o servilo con cualquier http server)
3. Completá los datos de empresa y cliente
4. Agregá productos/servicios con sus cantidades y precios
5. Ajustá los días de validez y las notas si querés
6. Hacé click en **Descargar PDF**

> **Tip**: podés hostearlo gratis en [GitHub Pages](https://pages.github.com/), [Netlify](https://www.netlify.com/) o [Vercel](https://vercel.com/).

## 🔒 Seguridad (OWASP)

- ✅ Sanitización de inputs (escape de HTML para prevenir XSS)
- ✅ Validación de tipo y tamaño de archivo (logo)
- ✅ Content Security Policy vía meta tag
- ✅ No usa `innerHTML` con datos del usuario
- ✅ Atributo `rel="noopener"` en links externos

## 📁 Estructura del proyecto

```
presupuesto-simple/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos personalizados
├── js/
│   └── app.js          # Lógica de la aplicación
├── assets/             # Recursos estáticos
├── .gitignore
└── README.md
```

## 🌐 Despliegue

### GitHub Pages

```bash
git init
git add .
git commit -m "Primer commit"
git remote add origin https://github.com/tuusuario/presupuesto-simple.git
git branch -M main
git push -u origin main
```

Luego en el repo: Settings → Pages → Source: `main` → `/root`.

### Netlify / Vercel

Arrastrá la carpeta del proyecto a la interfaz de deploy. No requiere configuración adicional.

## 📄 Licencia

MIT — hacé lo que quieras con este proyecto.

---

Hecho por [Rojas Informática](https://github.com/javierrojas62)
