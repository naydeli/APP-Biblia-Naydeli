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
        setBooks(data.data);
        setFilteredBooks(data.data);
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

  return (
    <div className="min-h-screen bg-green-50 flex flex-col text-gray-200">
      <header className="bg-gradient-to-r from-green-300 to-green-500 py-6 text-center shadow-lg">
        <h1 className="text-4xl font-extrabold text-white">Reina Valera Biblia</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="bg-white p-6 w-1/2 overflow-y-auto border-r border-gray-300">
          <input
            type="text"
            placeholder="Buscar libro..."
            className="p-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 mb-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading && <p className="text-center text-green-500">Cargando...</p>}
          <div className="grid grid-cols-8 gap-2">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 bg-green-200 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-all flex items-center justify-center"
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
            <div>
              <button
                className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 focus:outline-none"
                onClick={() => setSelectedBook(null)}
              >
                <ArrowLeft className="mr-2 inline-block" /> Volver a los libros
              </button>
              <h2 className="text-2xl font-bold mb-4 text-green-600">{selectedBook.name}</h2>
              <div className="grid grid-cols-6 gap-4">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="p-4 bg-green-200 rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-all flex items-center justify-center"
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
            <div>
              <div className="flex justify-between mb-6">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 focus:outline-none"
                  onClick={() => setSelectedChapter(null)}
                >
                  <ArrowLeft className="mr-2 inline-block" /> Volver al capítulo
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 focus:outline-none"
                  onClick={deselectAllVerses}
                >
                  Deseleccionar todos los versículos
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 focus:outline-none"
                  onClick={fetchVersesText}
                  disabled={selectedVerses.length === 0 || loading}
                >
                  {loading ? "Cargando..." : "Buscar textos seleccionados"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {verses.map((verse) => (
                  <div
                    key={verse.id}
                    className={`p-4 ${
                      selectedVerses.some((v) => v.id === verse.id)
                        ? "bg-green-400"
                        : "bg-green-200"
                    } rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transition-all flex items-center justify-center`}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h3 className="text-xl font-bold text-green-600 mb-4">Texto de los versículos seleccionados:</h3>
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <div className="text-lg text-gray-700 whitespace-pre-wrap">
              {versesText.join("\n\n")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReinaValeraBooks;
