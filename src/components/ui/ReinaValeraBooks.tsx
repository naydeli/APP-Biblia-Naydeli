import React, { useEffect, useState } from "react";
import {
  getReinaValeraBooks,
  getBookChapters,
  getChapterVerses,
  getVerseText,
} from "./api"; // Importa las funciones de la API
import { ArrowLeft,  LogOut  } from "lucide-react";
import {FaBible,  } from "react-icons/fa";
import { FaCheck } from 'react-icons/fa'; // Importando el icono de check

import { FcGoogle } from "react-icons/fc"; // Icono de Google
import { AiFillGithub } from "react-icons/ai"; // Icono de GitHub

import { getAuth, signOut } from "firebase/auth"; // Importar Firebase Auth

import { useNavigate,  } from "react-router-dom"; // Para la navegación

const ReinaValeraBooks: React.FC = () => {
  const auth = getAuth(); // Obtener la instancia de autenticación
  const navigate = useNavigate(); // Hook de navegación
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);
  const [verses, setVerses] = useState<any[]>([]);
  const [selectedVerses, setSelectedVerses] = useState<any[]>([]);
  const [versesText, setVersesText] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() =>{
    const unsubscribe =auth.onAuthStateChanged((user) => {
      if (user){
        setUser({
          email:user.email,
          provider: user.providerData[0]?.providerId,
        });
      }else{
        setUser(null);
      }
    });
    return() =>unsubscribe ();

  }, [auth]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await getReinaValeraBooks();
        const validBooks = data.data.filter((book: any) => book.name); // Filtrar elementos vacíos
        setBooks(validBooks);
        setFilteredBooks(validBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    setFilteredBooks(
      books.filter((book) =>
        book.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, books]);

  const handleBookClick = async (book: any) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setSelectedVerses([]);
    setVersesText([]);
    try {
      setLoading(true);
      const data = await getBookChapters(book.id);
      setChapters(data.data);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
    setTimeout(() => {
      document.getElementById("chapters-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleChapterClick = async (chapter: any) => {
    setSelectedChapter(chapter);
    setSelectedVerses([]);
    setVersesText([]);
    try {
      setLoading(true);
      const data = await getChapterVerses(chapter.id);
      setVerses(data.data);
    } catch (error) {
      console.error("Error fetching verses:", error);
    } finally {
      setLoading(false);
    }
    setTimeout(() => {
      document.getElementById("verses-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleVerseToggle = (verse: any) => {
    const alreadySelected = selectedVerses.some((v) => v.id === verse.id);
    if (alreadySelected) {
      setSelectedVerses((prev) => prev.filter((v) => v.id !== verse.id));
    } else {
      setSelectedVerses((prev) => [...prev, verse]);
    }
  };
 

  const fetchVersesText = async () => {
    try {
      setLoading(true);
  
      // Ordenar de menor a mayor basado en el número del versículo
      const sortedVerses = [...selectedVerses].sort((a, b) => {
        const verseA = parseInt(a.reference.split(":")[1]);
        const verseB = parseInt(b.reference.split(":")[1]);
        return verseA - verseB; // Orden ascendente
      });
  
      // Actualizar el estado con los versículos ordenados
      setSelectedVerses(sortedVerses);
  
      // Obtener los textos de los versículos en el orden correcto
      const texts = await Promise.all(
        sortedVerses.map(async (verse) => {
          const data = await getVerseText(verse.id);
          const parser = new DOMParser();
          const parsedDocument = parser.parseFromString(data.data.content, "text/html");
          return parsedDocument.body.textContent || "";
        })
      );
  
      // Actualizar estado con los textos obtenidos
      setVersesText(texts);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching verses text:", error);
    } finally {
      setLoading(false);
    }
  };
  

  

  const deselectAllVerses = () => {
    setSelectedVerses([]);
    setVersesText([]);
  };

  const handleCloseModal = () => {
    deselectAllVerses(); // Deseleccionar versos al cerrar el modal
    setShowModal(false);
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirige al usuario a la pantalla de inicio de sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col text-gray-500 w-full">
      <header className="bg-gradient-to-r from-green-300 to-green-500 h-20 px-6 shadow-lg flex items-center justify-center relative">
        <FaBible className="text-green-800 text-3xl mx-4 " />
        <h1 className="text-4xl font-extrabold text-white">Biblia Reina Valera</h1>
        {user && (
         <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 sm:gap-4">
            {/* Contenedor del icono y email */}
           <div className="flex items-center gap-2 bg-white/40 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
              {user.provider === "google.com" && <FcGoogle className="w-5 h-5 sm:w-6 sm:h-6" />}
             {user.provider === "github.com" && <AiFillGithub className="w-5 h-5 sm:w-6 sm:h-6 text-black" />}
             <span className="text-white text-xs sm:text-sm hidden md:inline">{user.email}</span>
           </div>

           { /* Botón de cerrar sesión */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg transition-all duration-300"
              >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline">Cerrar Sesión</span>
           </button>
         </div>

        )}
      </header>
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="bg-white p-6 md:w-1/3 overflow-y-auto border-r border-gray-500">
          <input
            type="text"
            placeholder="Buscar libro..."
            className="p-2 w-full rounded-3xl border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading && <p className="text-center text-green-500">Cargando...</p>}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 bg-green-200 rounded-3xl shadow-lg cursor-pointer hover:shadow-2xl transition-all flex items-center justify-center"
                onClick={() => handleBookClick(book)}
              >
                <h3 className="text-lg font-semibold text-green-600 text-center break-words">
                  {book.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {!selectedBook ? (
            <p className="text-center text-green-500 text-lg">Selecciona un libro para empezar</p>
          ) : !selectedChapter ? (
            <div id="chapters-section" className="max-h-[50vh] sm:max-h-full overflow-y-auto">
              <button
                className="mb-4 px-4 py-2 bg-green-500 text-white rounded-3xl shadow hover:bg-green-600 focus:outline-none"
                onClick={() => setSelectedBook(null)}
              >
                <ArrowLeft className="mr-2 inline-block" /> Volver a los libros
              </button>
            
              <h2 className="text-2xl font-bold mb-4 text-green-600">{selectedBook.name}</h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                
                {chapters.slice(1).map((chapter) => (
                  <div
                    key={chapter.id}
                    className="p-4 bg-green-200 rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all flex items-center justify-center"
                    onClick={() => handleChapterClick(chapter)}
                  >
                    <h3 className="text-lg font-semibold text-green-600 text-center break-words">
                      {chapter.reference}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div id="verses-section" className="max-h-[50vh] sm:max-h-full overflow-y-auto">
              <div className="flex gap-2 justify-between mb-6">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-3xl shadow hover:bg-green-600 focus:outline-none"
                  onClick={() => setSelectedChapter(null)}
                >
                  <ArrowLeft className="mr-2 inline-block" /> Volver al capítulo
                </button>
                
                

                <button
                 className="px-4 py-2 bg-green-500 text-white rounded-3xl shadow hover:bg-green-600 focus:outline-none flex items-center justify-center gap-2"
                 onClick={fetchVersesText}
                 disabled={loading}
                >
                 {/* Icono de check visible siempre que no esté cargando */}
                 {!loading && <FaCheck className="w-5 h-5 sm:hidden" />}

                  {/* Texto visible en pantallas grandes, oculto en móviles */}
                  <span className="hidden sm:block">
                    {loading ? "Cargando..." : "Buscar versículo"}
                  </span>

                     {/* Icono de check visible en pantallas grandes */}
                     {!loading && <FaCheck className="w-5 h-5 hidden sm:block ml-2" />}
               </button>

              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {verses.map((verse) => (
                  <div
                    key={verse.id}
                    className={`p-4 ${
                      selectedVerses.some((v) => v.id === verse.id)
                        ? "bg-green-400"
                        : "bg-green-200"
                    } rounded-3xl shadow-lg cursor-pointer hover:shadow-2xl  transition-all flex items-center justify-center`}
                    onClick={() => handleVerseToggle(verse)}
                  >
                    <h3 className="text-lg font-semibold text-green-600 text-center break-words">
                      {verse.reference}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

        
      {/* Modal */}
     {showModal && (
       <div
         onClick={handleCloseModal}
         className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
         >
         <div
           onClick={(e) => e.stopPropagation()} // Evita cerrar el modal al hacer clic dentro del contenido
           className="bg-white p-8 rounded-2xl shadow-2xl shadow-green-500 max-w-3xl w-full max-h-[85vh] overflow-hidden relative">
           {/* Header del Modal */}
            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
              <h3 className="text-xl font-bold text-green-700">
              {selectedBook && selectedChapter && selectedVerses.length > 0
              ? `${selectedChapter.reference}:${ Math.min(...selectedVerses.map((v) => 
              parseInt(v.reference.split(':')[1]))) }-${ Math.max(...selectedVerses.map((v) => 
              parseInt(v.reference.split(':')[1])))}`: "Biblia Reina Valera"}
              </h3>
              <button
              className="text-gray-600 hover:text-gray-900 focus:outline-none text-3xl"
             onClick={handleCloseModal}>
             ✕
             </button>
            </div>

           {/* Contenido del Modal */}
           <div className="text-lg text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[70vh] pr-4">
              {versesText.length > 0 ? (
               versesText.map((verse, index) => (
               <div key={index} className="mb-2">
                 <div className="bg-green-50 text-green-800 p-4 rounded-lg shadow-md">
                   <p className="font-medium  leading-relaxed">{verse}</p>
                 </div>
               </div>
               ))
               ) : (
               <div className="flex items-center justify-center h-full">
                 <p className="text-gray-500 text-center">No hay versículos seleccionados.</p>
               </div>
              )}
           </div>

      
          </div>
       </div>
      )}


    </div>
  );
};

export default ReinaValeraBooks;