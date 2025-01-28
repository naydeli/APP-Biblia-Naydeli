import React, { useEffect, useState } from "react";
import {
  getReinaValeraBooks,
  getBookChapters,
  getChapterVerses,
  getVerseText,
} from "./api"; // Importa las funciones de la API
import { ArrowLeft } from "lucide-react";

const ReinaValeraBooks: React.FC = () => {
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
      const texts = await Promise.all(
        selectedVerses.map(async (verse) => {
          const data = await getVerseText(verse.id);
          const parser = new DOMParser();
          const parsedDocument = parser.parseFromString(data.data.content, "text/html");
          return parsedDocument.body.textContent || "";
        })
      );
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

  return (
    <div className="min-h-screen bg-green-50 flex flex-col text-gray-500 w-full">
      <header className="bg-gradient-to-r from-green-300 to-green-500 py-6 text-center shadow-lg">
        <h1 className="text-4xl font-extrabold text-white">Biblia Reina Valera </h1>
      </header>
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="bg-white p-6 md:w-1/3 overflow-y-auto border-r border-gray-500">
          <input
            type="text"
            placeholder="Buscar libro..."
            className="p-2 w-full rounded-lg border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-9"
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
                  className="px-4 py-2  bg-green-500 text-white rounded-3xl shadow hover:bg-green-600 focus:outline-none"
                  onClick={fetchVersesText}
                  disabled={selectedVerses.length === 0 || loading}
                >
                  {loading ? "Cargando..." : "Buscar versiculo"}
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
              <h3 className="text-xl font-bold text-green-700">{selectedBook.name}</h3>
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
                   <p className="font-medium leading-relaxed">{verse}</p>
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
