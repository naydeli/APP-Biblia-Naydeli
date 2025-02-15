import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReinaValeraBooks from '../ReinaValeraBooks';
import {
  getReinaValeraBooks,
  getBookChapters,
  getChapterVerses,
  getVerseText,
} from '../api';

vi.mock('../api', () => ({
  getReinaValeraBooks: vi.fn(),
  getBookChapters: vi.fn(),
  getChapterVerses: vi.fn(),
  getVerseText: vi.fn(),
}));

describe('Componente ReinaValeraBooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('se renderiza sin fallar', () => {
    render(<ReinaValeraBooks />);
    expect(screen.getByText(/Biblia Reina Valera/i)).toBeInTheDocument();
  });

  it('obtiene y muestra los libros al cargarse', async () => {
    const librosMock = [
      { id: 1, name: 'Génesis' },
      { id: 2, name: 'Éxodo' },
    ];
    getReinaValeraBooks.mockResolvedValueOnce({ data: librosMock });

    render(<ReinaValeraBooks />);

    expect(getReinaValeraBooks).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText('Génesis')).toBeInTheDocument());
    expect(screen.getByText('Éxodo')).toBeInTheDocument();
  });

  it('filtra los libros según la búsqueda', async () => {
    const librosMock = [
      { id: 1, name: 'Génesis' },
      { id: 2, name: 'Éxodo' },
    ];
    getReinaValeraBooks.mockResolvedValueOnce({ data: librosMock });

    render(<ReinaValeraBooks />);

    await waitFor(() => screen.getByText('Génesis'));
    fireEvent.change(screen.getByPlaceholderText(/buscar libro/i), {
      target: { value: 'Gén' },
    });

    expect(screen.getByText('Génesis')).toBeInTheDocument();
    expect(screen.queryByText('Éxodo')).not.toBeInTheDocument();
  });

  it('obtiene y muestra los capítulos cuando se selecciona un libro', async () => {
    const librosMock = [{ id: 1, name: 'Génesis' }];
    const capitulosMock = [
      { id: 101, reference: 'Génesis 1' },
      { id: 102, reference: 'Génesis 2' },
    ];

    getReinaValeraBooks.mockResolvedValueOnce({ data: librosMock });
    getBookChapters.mockResolvedValueOnce({ data: capitulosMock });

    render(<ReinaValeraBooks />);

    await waitFor(() => screen.getByText('Génesis'));
    fireEvent.click(screen.getByText('Génesis'));

    await waitFor(() => screen.getByText('Génesis 1'));
    expect(screen.getByText('Génesis 2')).toBeInTheDocument();
  });

  it('obtiene y muestra los versículos cuando se selecciona un capítulo', async () => {
    const capitulosMock = [{ id: 101, reference: 'Génesis 1' }];
    const versiculosMock = [
      { id: 1001, reference: 'Génesis 1:1' },
      { id: 1002, reference: 'Génesis 1:2' },
    ];

    getBookChapters.mockResolvedValueOnce({ data: capitulosMock });
    getChapterVerses.mockResolvedValueOnce({ data: versiculosMock });

    render(<ReinaValeraBooks />);

    fireEvent.click(screen.getByText('Génesis 1'));

    await waitFor(() => screen.getByText('Génesis 1:1'));
    expect(screen.getByText('Génesis 1:2')).toBeInTheDocument();
  });

  it('obtiene y muestra el texto del versículo seleccionado en un modal', async () => {
    const versiculosMock = [{ id: 1001, reference: 'Génesis 1:1' }];
    const textoMock = { data: { content: '<p>En el principio creó Dios los cielos y la tierra.</p>' } };

    getChapterVerses.mockResolvedValueOnce({ data: versiculosMock });
    getVerseText.mockResolvedValueOnce(textoMock);

    render(<ReinaValeraBooks />);

    fireEvent.click(screen.getByText('Génesis 1:1'));
    fireEvent.click(screen.getByText(/Buscar versículo/i));

    await waitFor(() => screen.getByText(/En el principio creó Dios los cielos/i));
  });
});