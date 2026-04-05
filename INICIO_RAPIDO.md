# 🚀 INICIO RÁPIDO - NutriRecetas

Sigue estos 5 pasos para tener tu app en vivo en menos de 30 minutos.

---

## 📌 Paso 1: Crear Proyecto Firebase (5 min)

### 1.1 Ir a Firebase Console
- Abre: https://console.firebase.google.com/
- Inicia sesión con Google

### 1.2 Crear proyecto
- Botón "Crear proyecto"
- Nombre: `NutriRecetas`
- Siguiente → Crear

### 1.3 Habilitar Realtime Database
- **Build** → **Realtime Database**
- Crear base de datos
- Región: `europe-west1` (Bélgica)
- Modo: **Modo de prueba**
- Habilitar

### 1.4 Habilitar Autenticación Anónima
- **Build** → **Authentication**
- Empezar
- **Anónimo** → Activar
- Guardar

### 1.5 Obtener credenciales
- Ícono ⚙️ (arriba izq) → **Configuración del proyecto**
- Tab **General** → Baja hasta **Tus aplicaciones**
- Ícono `</> (Web)`
- Registrar
- **Copia la configuración** (necesitarás estos valores)

---

## 💻 Paso 2: Instalar Localmente (5 min)

```bash
# Abre Terminal/CMD en tu carpeta de proyectos

# Clonar
git clone https://github.com/tu-usuario/nutrirecetas.git
cd nutrirecetas

# Instalar dependencias
npm install
```

---

## 🔑 Paso 3: Configurar Firebase (2 min)

En la **raíz del proyecto**, crea archivo `.env.local`:

```
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=nutrirecetas-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://nutrirecetas-xxxxx.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=nutrirecetas-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=nutrirecetas-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Reemplaza** con los valores que copiaste en Paso 1.5

---

## ✅ Paso 4: Probar Localmente (1 min)

```bash
npm start
```

Se abrirá en `http://localhost:3000`

**¡Prueba!**
- Agrega un ingrediente
- Genera una receta
- Verifica que funcione

---

## 📤 Paso 5: Subir a GitHub y Publicar (10 min)

### 5.1 Crear repositorio en GitHub

- Ve a: https://github.com/new
- Nombre: `nutrirecetas`
- Público
- Create

### 5.2 Editar package.json

Busca esta línea en `package.json`:

```json
"homepage": "https://tu-usuario-github.github.io/nutrirecetas",
```

**Reemplaza `tu-usuario` con tu usuario de GitHub**

### 5.3 Push a GitHub

```bash
git init
git add .
git commit -m "Inicial: NutriRecetas"
git branch -M main
git remote add origin https://github.com/tu-usuario/nutrirecetas.git
git push -u origin main
```

### 5.4 Desplegar en GitHub Pages

```bash
npm run deploy
```

### 5.5 Autorizar en Firebase

En Firebase Console:
- Configuración del proyecto
- Tab "Autorización de dominio"
- Agregar dominio
- Escribe: `tu-usuario-github.github.io`
- Agregar

---

## 🎉 ¡LISTO!

Tu app está en vivo en:

```
https://tu-usuario-github.github.io/nutrirecetas
```

---

## 📱 Cómo Funciona

### **Dashboard**
Vista general con estadísticas

### **Mi Despensa**
Agrega ingredientes: "Pechuga | 500g"

### **Generar Receta**
- **Opción 1:** Selecciona ingredientes → Generar
- **Opción 2:** Especifica macros (proteína/carbos/grasas) → Generar

### **Mis Recetas**
Ver recetas guardadas, pasos e ingredientes

### **Lista de Compra Compartida**
1. Click "Compartir Lista"
2. Generar código
3. Comparte el código con tu marido
4. Él ingresa el código
5. ¡Ambos ven la lista en tiempo real!

### **Menú Semanal**
Planifica los 7 días para ti, tu marido e hijo

---

## 🔒 Seguridad

- Los datos se guardan en Firebase (nube segura)
- Sincronización en tiempo real
- Lista solo se comparte con código

---

## 📚 Documentos Importantes

- **README.md** - Guía completa
- **SETUP.md** - Configuración detallada
- **FEATURES.md** - Guía de funcionalidades avanzadas

---

## ⚡ Quick Tips

```bash
# Para actualizar en el futuro:
git add .
git commit -m "Descripción de cambios"
git push origin main
npm run deploy

# Para desarrollo local:
npm start

# Para compilar para producción:
npm run build
```

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| Error Firebase | Verifica `.env.local` con credenciales correctas |
| Página 404 | Espera 2 min después de `npm run deploy` |
| npm install falla | Instala Node.js desde nodejs.org |
| Datos no se guardan | Comprueba autenticación anónima en Firebase |

---

## 📧 Soporte

Revisa los archivos:
- `README.md` - Completo
- `SETUP.md` - Paso a paso detallado
- `FEATURES.md` - Guía avanzada

¡Disfruta NutriRecetas! 🥗
