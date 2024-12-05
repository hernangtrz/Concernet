import React, { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithEmailAndPassword, signOut } from "./firebaseConfig"; // Importa Firebase y funciones
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Importamos Firestore

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("site") || "");
  const navigate = useNavigate();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Obtener los datos del usuario y su rol desde Firestore
        const userDocRef = doc(db, "usuarios", currentUser.uid); // Suponiendo que el UID del usuario es la clave
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: currentUser.uid,
            username: userData.username,
            role: userData.role, // El rol lo obtenemos de Firestore
          });
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
          localStorage.setItem("site", idToken);
        }
      } else {
        setUser(null);
        setToken("");
        localStorage.removeItem("site");
      }
    });

    return () => unsubscribe();
  }, [db]);

  const loginAction = async (data) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.username,
        data.password
      );
      const currentUser = userCredential.user;
      console.log(currentUser);

      // Obtener el rol del usuario desde Firestore después de la autenticación
      const userDocRef = doc(db, "usuarios", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(userData); // Verifica que los datos se estén obteniendo correctamente
        setUser({
          uid: currentUser.uid,
          username: userData.username,
          role: userData.role, // Asignamos el rol
        });
        const idToken = await currentUser.getIdToken();
        setToken(idToken);
        localStorage.setItem("site", idToken);
        navigate("/Dashboard");
      } else {
        throw new Error("Usuario no encontrado en la base de datos");
      }
    } catch (error) {
      console.error("Error de login:", error);
      alert("Usuario o contraseña incorrectos"); // Muestra un mensaje de error
    }
  };

  const logOut = async () => {
    await signOut(auth);
    setUser(null);
    setToken("");
    localStorage.removeItem("site");
    navigate("/Login"); // Redirige al login después de cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ token, user, loginAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// Hook personalizado
export const useAuth = () => {
  return useContext(AuthContext);
};
