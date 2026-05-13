# 🧾 Presupuesto Simple

Aplicación web 100% frontend para crear presupuestos profesionales y descargarlos en PDF.  
Sin servidores, sin bases de datos — solo abrí el `index.html` y ya podés crear presupuestos.

## ✨ Características

- **Datos de empresa**: nombre, CUIT, email, dirección, teléfono + logo
- **Datos de cliente**: nombre, CUIT, email
- **Tabla dinámica de productos**: agregá y eliminá filas con cálculo automático de subtotales y total
- **Validez del presupuesto**: configurable en días, fechas calculadas automáticamente
- **Notas / descripción**: campo libre para condiciones de pago, garantía, etc.
- **Exportación a PDF**: apertura en ventana de impresión (Guardar como PDF nativo)
- **Diseño responsive**: Bootstrap 5, funciona en celular, tablet y desktop
- **Español y moneda local**: formato `$ 1.234,56`
- **Seguridad básica OWASP**: sanitización de inputs, validación de archivos, CSP

## 🚀 Demo

👉 [Ver demo en GitHub Pages](https://javierrojas62.github.io/PresupuestoSimple/)

## 📦 Tecnologías

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| HTML5 | — | Estructura |
| CSS3 + Custom Properties | — | Estilos |
| Bootstrap | 5.3.2 | Grid responsive + componentes |
| JavaScript (Vanilla) | ES2020 | Toda la lógica |
| Web Print API (nativa) | — | Impresión / PDF nativo del navegador |
| Google Fonts (Inter) | — | Tipografía |

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

## 📄 Licencia

MIT — hacé lo que quieras con este proyecto.

---

Hecho por [Rojas Informática](https://github.com/javierrojas62)
