# 🔧 Guía de Configuración Paso a Paso

Este documento te guía paso a paso por toda la configuración necesaria.

---

## Parte 1: Configurar Firebase

### Paso 1: Ir a Firebase Console

1. Abre [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google (crea una si no tienes)

### Paso 2: Crear un proyecto

1. Haz clic en **"Crear un proyecto"**
2. Nombre del proyecto: `NutriRecetas`
3. Desactiva la opción **"Habilitar Google Analytics para este proyecto"** (opcional)
4. Haz clic en **"Crear proyecto"**
5. Espera a que se cree (toma unos 30 segundos)

### Paso 3: Habilitar Realtime Database

1. En la parte izquierda, ve a **Build** (si no ves, expande el menú)
2. Busca y haz clic en **Realtime Database**
3. Haz clic en **"Crear base de datos"**
4. **Ubicación:** `europe-west1 (Bélgica)` - la más cercana a España
5. **Modo de seguridad:** Selecciona **"Comenzar en modo de prueba"**
6. Haz clic en **"Habilitar"**

Verás un URL así: `https://nutrirecetas-xxxxx.firebaseio.com`

### Paso 4: Habilitar Autenticación Anónima

1. En la izquierda, ve a **Build** → **Authentication**
2. Haz clic en **"Empezar"**
3. Busca **"Anónimo"** en la lista
4. Haz clic en **Anónimo**
5. Activa el toggle **"Habilitar"**
6. Haz clic en **"Guardar"**

### Paso 5: Obtener las credenciales de Firebase

1. Haz clic en el **ícono de engranaje** ⚙️ (arriba a la izquierda)
2. Ve a **"Configuración del proyecto"**
3. Ve a la pestaña **"General"**
4. Baja hasta **"Tus aplicaciones"**
5. Haz clic en el ícono **</> (Web)**
6. Dale un apodo: `NutriRecetas Web`
7. Marca **"También crea un proyecto de Cloud Messaging"** (opcional)
8. Haz clic en **"Registrar aplicación"**

Se te mostrará un código de configuración:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "nutrirecetas-xxxxx.firebaseapp.com",
  databaseURL: "https://nutrirecetas-xxxxx.firebaseio.com",
  projectId: "nutrirecetas-xxxxx",
  storageBucket: "nutrirecetas-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**📋 Copia todos estos valores, los necesitarás en el siguiente paso.**

---

## Parte 2: Configurar el Proyecto Localmente

### Paso 1: Clonar el repositorio

```bash
# Abre Terminal/CMD en tu carpeta de proyectos
git clone https://github.com/tu-usuario/nutrirecetas.git
cd nutrirecetas
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Esto instalará React, Firebase, y todas las librerías necesarias.

### Paso 3: Crear archivo .env.local

En la **raíz del proyecto** (carpeta `nutrirecetas`), crea un archivo llamado `.env.local`:

**Contenido:**

```
REACT_APP_FIREBASE_API_KEY=AIza...aqui_tu_apiKey...
REACT_APP_FIREBASE_AUTH_DOMAIN=nutrirecetas-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://nutrirecetas-xxxxx.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=nutrirecetas-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=nutrirecetas-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Reemplaza cada valor** con los que copiaste de Firebase Console.

### Paso 4: Probar localmente

```bash
npm start
```

Se abrirá automáticamente en `http://localhost:3000`

**¡Prueba la app!**
- Agrega ingredientes
- Genera una receta
- Comprueba que los datos se guardan en Firebase

---

## Parte 3: Subir a GitHub

### Paso 1: Crear repositorio en GitHub

1. Ve a [https://github.com/new](https://github.com/new)
2. Nombre del repositorio: `nutrirecetas`
3. Descripción: `Recetas personalizadas con lista de compra compartida`
4. Visibilidad: **Público**
5. Haz clic en **"Create repository"**

Se te mostrará un URL: `https://github.com/tu-usuario/nutrirecetas`

### Paso 2: Actualizar package.json

En tu carpeta del proyecto, abre `package.json` y busca la línea:

```json
"homepage": "https://tu-usuario-github.github.io/nutrirecetas",
```

**Reemplaza `tu-usuario` con tu nombre de usuario de GitHub.**

### Paso 3: Push inicial a GitHub

En Terminal/CMD:

```bash
# Inicializa git (si aún no lo has hecho)
git init

# Agrega todos los archivos
git add .

# Primer commit
git commit -m "Inicial: NutriRecetas app"

# Renombra la rama a main
git branch -M main

# Agrega el origen remoto (reemplaza tu-usuario)
git remote add origin https://github.com/tu-usuario/nutrirecetas.git

# Push a GitHub
git push -u origin main
```

Verifica en GitHub que los archivos están subidos.

### Paso 4: Desplegar a GitHub Pages

```bash
npm run deploy
```

Esto:
1. Compila el proyecto (`npm run build`)
2. Sube el contenido compilado a la rama `gh-pages`
3. GitHub Pages lo publica automáticamente

**Espera 1-2 minutos**, luego tu app estará disponible en:

```
https://tu-usuario-github.github.io/nutrirecetas
```

### Paso 5: Verificar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Ve a **Settings**
3. En la izquierda, ve a **Pages**
4. Verifica que **Source** está en **gh-pages branch**
5. Debajo verás la URL verde: "Your site is live at..."

---

## Parte 4: Autorizar tu dominio en Firebase

Para que Firebase funcione en producción (en GitHub Pages), necesitas autorizar tu dominio:

1. En Firebase Console → **Configuración del proyecto**
2. Ve a la pestaña **"Autorización de dominio"**
3. Haz clic en **"Agregar dominio"**
4. Escribe: `tu-usuario-github.github.io`
5. Haz clic en **"Agregar"**

---

## Parte 5: Configurar Seguridad de Firebase (Importante)

Por defecto, Firebase en "modo prueba" permite a cualquiera leer y escribir datos. Para mayor seguridad:

1. En Firebase Console → **Realtime Database**
2. Ve a la pestaña **"Reglas"**
3. Reemplaza el contenido con:

```json
{
  "rules": {
    "usuarios": {
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid"
      }
    }
  }
}
```

Haz clic en **"Publicar"**

---

## 🎉 ¡Listo!

Tu aplicación NutriRecetas está:
- ✅ Corriendo localmente en `localhost:3000`
- ✅ Subida a GitHub
- ✅ Desplegada en GitHub Pages
- ✅ Conectada a Firebase Realtime Database

---

## 📋 Checklist Final

- [ ] Firebase Console cuenta creada
- [ ] Realtime Database habilitada
- [ ] Autenticación anónima habilitada
- [ ] Credenciales copiadas
- [ ] `.env.local` creado con las credenciales
- [ ] `npm install` ejecutado
- [ ] `npm start` funciona localmente
- [ ] GitHub repositorio creado
- [ ] `package.json` actualizado con URL correcta
- [ ] `npm run deploy` ejecutado
- [ ] GitHub Pages habilitado
- [ ] Dominio autorizado en Firebase
- [ ] ✨ ¡Aplicación en vivo!

---

## ⚠️ Notas Importantes

1. **Nunca subas `.env.local` a GitHub** - ya está en `.gitignore`
2. **Mantén tus credenciales de Firebase privadas**
3. **El plan gratuito de Firebase incluye:**
   - 100 conexiones simultáneas
   - 1GB de almacenamiento
   - Perfecto para uso familiar

4. **Actualizaciones futuras:**
   ```bash
   git add .
   git commit -m "Describa los cambios"
   git push origin main
   npm run deploy
   ```

---

## 🆘 Ayuda

Si tienes problemas:

1. **Error de credenciales:** Verifica que copiaste correctamente los valores de Firebase
2. **GitHub Pages muestra 404:** Espera 2 minutos después de hacer deploy
3. **Los datos no se guardan:** Comprueba que autenticación anónima está habilitada
4. **CORS errors:** Verifica que autoriza el dominio en Firebase

---

¡Cualquier duda, avísame! 🚀
