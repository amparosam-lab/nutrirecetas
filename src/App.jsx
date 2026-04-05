import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove, update } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ChefHat, Plus, Trash2, Calendar, ShoppingCart, Book, Home, Zap, Copy, Share2, Users, LogOut } from 'lucide-react';
import './App.css';

// Configuración de Firebase (copia tu config de Firebase Console)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export default function NutriRecetas() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [pantry, setPantry] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [shoppingList, setShoppingList] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [generateMode, setGenerateMode] = useState('ingredients');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [macros, setMacros] = useState({ protein: 30, carbs: 50, fat: 20 });
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Autenticación Firebase
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        signInAnonymously(auth)
          .then(() => {
            const name = localStorage.getItem('userName') || `Usuario_${Math.random().toString(36).substr(2, 5)}`;
            setUserName(name);
            localStorage.setItem('userName', name);
          })
          .catch((error) => console.error('Error de autenticación:', error));
      } else {
        setUser(currentUser);
        const name = localStorage.getItem('userName') || `Usuario_${Math.random().toString(36).substr(2, 5)}`;
        setUserName(name);
        localStorage.setItem('userName', name);
        loadDataFromFirebase(currentUser.uid, name);
      }
      setLoading(false);
    });
  }, []);

  // Cargar datos desde Firebase
  const loadDataFromFirebase = (uid, name) => {
    const userRef = ref(database, `usuarios/${uid}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPantry(data.pantry || []);
        setRecipes(data.recipes || []);
        setWeeklyMenu(data.weeklyMenu || {});
        setShoppingList(data.shoppingList || []);
      }
    });
  };

  // Guardar datos en Firebase
  const saveToFirebase = (dataType, data) => {
    if (!user) return;
    const userRef = ref(database, `usuarios/${user.uid}/${dataType}`);
    set(userRef, data);
  };

  // Agregar ingrediente a despensa
  const addToPantry = () => {
    if (newIngredient.trim()) {
      const [name, quantity] = newIngredient.split('|');
      const newPantry = [...pantry, {
        id: Date.now(),
        name: name.trim(),
        quantity: quantity?.trim() || '1 unidad',
        addedDate: new Date().toLocaleDateString('es-ES')
      }];
      setPantry(newPantry);
      saveToFirebase('pantry', newPantry);
      setNewIngredient('');
    }
  };

  // Eliminar ingrediente
  const removeFromPantry = (id) => {
    const newPantry = pantry.filter(p => p.id !== id);
    setPantry(newPantry);
    saveToFirebase('pantry', newPantry);
  };

  // Generar receta con IA
  const generateRecipe = async () => {
    if (generateMode === 'ingredients' && selectedIngredients.length === 0) {
      alert('Selecciona al menos un ingrediente');
      return;
    }

    let prompt = '';
    if (generateMode === 'ingredients') {
      const ingredientNames = selectedIngredients
        .map(id => pantry.find(p => p.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      prompt = `Crea una receta saludable y sencilla usando estos ingredientes: ${ingredientNames}.
      
      Responde SOLO en JSON sin markdown, sin preamble ni backticks:
      {
        "name": "Nombre de la receta",
        "difficulty": "fácil",
        "servings": 4,
        "prepTime": 15,
        "cookTime": 20,
        "ingredients": [
          {"name": "ingrediente", "quantity": 200, "unit": "g", "calories": 150}
        ],
        "steps": ["paso 1", "paso 2"],
        "tips": ["consejo 1"],
        "nutrition": {"calories": 450, "protein": 25, "carbs": 45, "fat": 8}
      }`;
    } else {
      prompt = `Crea una receta saludable con: ${macros.protein}g proteína, ${macros.carbs}g carbohidratos, ${macros.fat}g grasas.
      
      Responde SOLO en JSON sin markdown, sin preamble ni backticks:
      {
        "name": "Nombre",
        "difficulty": "fácil",
        "servings": 4,
        "prepTime": 15,
        "cookTime": 20,
        "ingredients": [{"name": "ingrediente", "quantity": 200, "unit": "g", "calories": 150}],
        "steps": ["paso 1"],
        "tips": ["consejo"],
        "nutrition": {"calories": 450, "protein": ${macros.protein}, "carbs": ${macros.carbs}, "fat": ${macros.fat}}
      }`;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const recipeText = data.content[0].text;
      const recipe = JSON.parse(recipeText);

      const newRecipe = {
        id: Date.now(),
        ...recipe,
        createdDate: new Date().toLocaleDateString('es-ES')
      };
      const newRecipes = [...recipes, newRecipe];
      setRecipes(newRecipes);
      saveToFirebase('recipes', newRecipes);
      setCurrentRecipe(newRecipe);
      setCurrentTab('recipes');
      setSelectedIngredients([]);
    } catch (error) {
      alert('Error al generar receta: ' + error.message);
    }
  };

  // Agregar a lista de compra
  const addIngredientsToShopping = (recipeId, quantity = 1) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      const newList = [...shoppingList];
      recipe.ingredients.forEach(ing => {
        const exists = newList.find(item => item.name === ing.name);
        if (exists) {
          exists.quantity += ing.quantity * quantity;
        } else {
          newList.push({
            id: Date.now() + Math.random(),
            name: ing.name,
            quantity: ing.quantity * quantity,
            unit: ing.unit,
            purchased: false,
            addedBy: userName
          });
        }
      });
      setShoppingList(newList);
      saveToFirebase('shoppingList', newList);
      alert('Ingredientes agregados');
    }
  };

  // Generar código para compartir
  const generateShareCode = () => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    localStorage.setItem(`shareCode_${code}`, user.uid);
    setShareCode(code);
  };

  // Copiar código al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareCode);
    alert('Código copiado al portapapeles');
  };

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f0f7 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
        <p style={{ color: '#666' }}>Cargando NutriRecetas...</p>
      </div>
    </div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #e8f0f7 100%)' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .header {
          background: linear-gradient(135deg, #2d5a3d 0%, #1a3a24 100%);
          color: white;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border-bottom: 3px solid #5fb878;
        }
        
        .header h1 {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .nav-tabs {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }
        
        .nav-tab {
          padding: 0.75rem 1.5rem;
          border: none;
          background: rgba(255,255,255,0.15);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .nav-tab:hover {
          background: rgba(255,255,255,0.25);
        }
        
        .nav-tab.active {
          background: #5fb878;
          box-shadow: 0 5px 15px rgba(95,184,120,0.3);
        }
        
        .container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
        }
        
        .card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-left: 4px solid #5fb878;
        }
        
        .input-group {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        input, select, textarea {
          padding: 0.75rem 1rem;
          border: 1.5px solid #e0e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #5fb878;
          box-shadow: 0 0 0 3px rgba(95,184,120,0.1);
        }
        
        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }
        
        .btn-primary {
          background: #5fb878;
          color: white;
        }
        
        .btn-primary:hover {
          background: #4a9a63;
        }
        
        .btn-secondary {
          background: #f0f4f8;
          color: #2d5a3d;
        }
        
        .btn-danger {
          background: #ef5350;
          color: white;
        }
        
        .ingredient-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e0e8f0;
        }
        
        .recipe-card {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e0e8f0;
          cursor: pointer;
        }
        
        .recipe-card:hover {
          background: #f0f4f8;
          border-color: #5fb878;
        }
        
        .shopping-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 3px solid #5fb878;
        }
        
        .steps-list {
          counter-reset: step-counter;
          list-style: none;
        }
        
        .steps-list li {
          counter-increment: step-counter;
          margin-bottom: 1rem;
          padding-left: 2.5rem;
          position: relative;
          line-height: 1.6;
        }
        
        .steps-list li:before {
          content: counter(step-counter);
          position: absolute;
          left: 0;
          top: 0;
          background: #5fb878;
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        
        @media (max-width: 768px) {
          .header h1 { font-size: 1.5rem; }
          .input-group { flex-direction: column; }
          input, select { width: 100%; }
        }
      `}</style>

      {/* HEADER */}
      <div className="header">
        <h1>
          <ChefHat size={32} />
          NutriRecetas
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
            👤 {userName}
          </div>
          <button className="btn" style={{ background: '#0ea5e9', color: 'white' }} onClick={() => setShowShareModal(true)}>
            <Share2 size={18} />
            Compartir Lista
          </button>
        </div>
        <div className="nav-tabs">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'pantry', label: 'Despensa', icon: Home },
            { id: 'generate', label: 'Generar', icon: Zap },
            { id: 'recipes', label: 'Recetas', icon: Book },
            { id: 'menu', label: 'Menú', icon: Calendar },
            { id: 'shopping', label: 'Compra', icon: ShoppingCart }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-tab ${currentTab === tab.id ? 'active' : ''}`}
                onClick={() => setCurrentTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL COMPARTIR */}
      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#2d5a3d', marginBottom: '1rem' }}>Compartir Lista de Compra</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Comparte este código con tu marido:</p>

            {!shareCode ? (
              <button className="btn btn-primary" onClick={generateShareCode} style={{ width: '100%', justifyContent: 'center' }}>
                <Share2 size={18} />
                Generar Código
              </button>
            ) : (
              <>
                <div style={{ background: '#f0faf5', border: '2px solid #5fb878', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', margin: '1.5rem 0' }}>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>Tu código:</p>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d5a3d', fontFamily: 'monospace', letterSpacing: '2px', margin: '1rem 0' }}>
                    {shareCode}
                  </div>
                  <button className="btn btn-primary" onClick={copyToClipboard} style={{ width: '100%', justifyContent: 'center' }}>
                    <Copy size={18} />
                    Copiar Código
                  </button>
                </div>
              </>
            )}

            <button className="btn btn-secondary" onClick={() => setShowShareModal(false)} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="container">
        {/* DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2d5a3d', margin: '0.5rem 0' }}>{pantry.length}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>INGREDIENTES</div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2d5a3d', margin: '0.5rem 0' }}>{recipes.length}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>RECETAS</div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2d5a3d', margin: '0.5rem 0' }}>{shoppingList.filter(i => !i.purchased).length}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>POR COMPRAR</div>
              </div>
            </div>
          </div>
        )}

        {/* MI DESPENSA */}
        {currentTab === 'pantry' && (
          <div className="card">
            <h2 style={{ color: '#2d5a3d', marginBottom: '1rem', fontSize: '1.3rem' }}>Mis Ingredientes</h2>
            <div className="input-group">
              <input
                type="text"
                placeholder="Ej: Pechuga de pollo | 500g"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToPantry()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={addToPantry}>
                <Plus size={18} />
                Agregar
              </button>
            </div>

            {pantry.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Sin ingredientes</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pantry.map(ing => (
                  <div key={ing.id} className="ingredient-item">
                    <div>
                      <div style={{ fontWeight: '600', color: '#2d5a3d' }}>{ing.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#999' }}>{ing.quantity}</div>
                    </div>
                    <button className="btn btn-danger" onClick={() => removeFromPantry(ing.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* GENERAR RECETA */}
        {currentTab === 'generate' && (
          <div className="card">
            <h2 style={{ color: '#2d5a3d', marginBottom: '1.5rem', fontSize: '1.3rem' }}>Generar Receta</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                style={{
                  padding: '1rem',
                  border: generateMode === 'ingredients' ? '2px solid #5fb878' : '2px solid #e0e8f0',
                  background: generateMode === 'ingredients' ? '#f0faf5' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
                onClick={() => setGenerateMode('ingredients')}
              >
                🥘 Por Ingredientes
              </button>
              <button
                style={{
                  padding: '1rem',
                  border: generateMode === 'macros' ? '2px solid #5fb878' : '2px solid #e0e8f0',
                  background: generateMode === 'macros' ? '#f0faf5' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
                onClick={() => setGenerateMode('macros')}
              >
                ⚖️ Por Macronutrientes
              </button>
            </div>

            {generateMode === 'ingredients' ? (
              <div>
                {pantry.length === 0 ? (
                  <p style={{ color: '#999', padding: '2rem', textAlign: 'center' }}>Agrega ingredientes primero</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {pantry.map(ing => (
                      <label key={ing.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f8fafc', border: '1.5px solid #e0e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedIngredients.includes(ing.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIngredients([...selectedIngredients, ing.id]);
                            } else {
                              setSelectedIngredients(selectedIngredients.filter(id => id !== ing.id));
                            }
                          }}
                        />
                        <span>{ing.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>💪 Proteína (g)</label>
                  <input type="number" value={macros.protein} onChange={(e) => setMacros({ ...macros, protein: parseInt(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>🌾 Carbohidratos (g)</label>
                  <input type="number" value={macros.carbs} onChange={(e) => setMacros({ ...macros, carbs: parseInt(e.target.value) })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>🥑 Grasas (g)</label>
                  <input type="number" value={macros.fat} onChange={(e) => setMacros({ ...macros, fat: parseInt(e.target.value) })} style={{ width: '100%' }} />
                </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={generateRecipe} style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>
              <Zap size={20} />
              Generar con IA
            </button>
          </div>
        )}

        {/* MIS RECETAS */}
        {currentTab === 'recipes' && (
          <div>
            {currentRecipe ? (
              <div className="card">
                <button className="btn btn-secondary" onClick={() => setCurrentRecipe(null)} style={{ marginBottom: '1.5rem' }}>
                  ← Volver
                </button>
                <h1 style={{ color: '#2d5a3d', marginBottom: '1rem' }}>{currentRecipe.name}</h1>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', fontSize: '0.85rem', color: '#666', flexWrap: 'wrap' }}>
                  <span>⏱️ {currentRecipe.prepTime + currentRecipe.cookTime} min</span>
                  <span>👥 {currentRecipe.servings} porciones</span>
                  <span>🔥 {currentRecipe.difficulty}</span>
                </div>
                <button className="btn btn-primary" onClick={() => addIngredientsToShopping(currentRecipe.id)} style={{ marginBottom: '2rem' }}>
                  <ShoppingCart size={18} />
                  Agregar a Compra
                </button>

                <h3 style={{ color: '#2d5a3d', marginBottom: '1rem' }}>Ingredientes</h3>
                <table style={{ width: '100%', marginBottom: '2rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #5fb878' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#2d5a3d' }}>Ingrediente</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#2d5a3d' }}>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecipe.ingredients.map((ing, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e0e8f0' }}>
                        <td style={{ padding: '0.75rem' }}>{ing.name}</td>
                        <td style={{ padding: '0.75rem' }}>{ing.quantity} {ing.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 style={{ color: '#2d5a3d', marginBottom: '1rem' }}>Instrucciones</h3>
                <ol className="steps-list">
                  {currentRecipe.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="card">
                <h2 style={{ color: '#2d5a3d', marginBottom: '1rem' }}>Mis Recetas</h2>
                {recipes.length === 0 ? (
                  <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Sin recetas</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recipes.map(recipe => (
                      <div key={recipe.id} className="recipe-card" onClick={() => setCurrentRecipe(recipe)}>
                        <h3 style={{ color: '#2d5a3d' }}>{recipe.name}</h3>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.85rem', color: '#666' }}>
                          <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                          <span>👥 {recipe.servings} porciones</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* LISTA DE COMPRA */}
        {currentTab === 'shopping' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#2d5a3d', fontSize: '1.3rem' }}>Lista de Compra</h2>
              {shoppingList.length > 0 && (
                <button className="btn btn-secondary" onClick={() => setShoppingList([])}>
                  Limpiar
                </button>
              )}
            </div>

            {shoppingList.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>Agrega recetas a la lista</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {shoppingList.map(item => (
                  <div key={item.id} className="shopping-item" style={{ opacity: item.purchased ? 0.6 : 1 }}>
                    <input
                      type="checkbox"
                      checked={item.purchased}
                      onChange={(e) => {
                        const updated = shoppingList.map(i =>
                          i.id === item.id ? { ...i, purchased: e.target.checked } : i
                        );
                        setShoppingList(updated);
                        saveToFirebase('shoppingList', updated);
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#2d5a3d', textDecoration: item.purchased ? 'line-through' : 'none' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#999' }}>
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                    <button className="btn btn-danger" onClick={() => setShoppingList(shoppingList.filter(i => i.id !== item.id))}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
