import { describe, it, expect, vi , beforeEach} from 'vitest';
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

describe('ReinaValeraBooks Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ReinaValeraBooks />);
    expect(screen.getByText(/Biblia Reina Valera/i)).toBeInTheDocument();
  });

  it('fetches and displays books on load', async () => {
    const mockBooks = [
      { id: 1, name: 'Génesis' },
      { id: 2, name: 'Éxodo' },
    ];
    getReinaValeraBooks.mockResolvedValueOnce({ data: mockBooks });

    render(<ReinaValeraBooks />);

    expect(getReinaValeraBooks).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText('Génesis')).toBeInTheDocument());
    expect(screen.getByText('Éxodo')).toBeInTheDocument();
  });

  it('filters books by search input', async () => {
    const mockBooks = [
      { id: 1, name: 'Génesis' },
      { id: 2, name: 'Éxodo' },
    ];
    getReinaValeraBooks.mockResolvedValueOnce({ data: mockBooks });

    render(<ReinaValeraBooks />);

    await waitFor(() => screen.getByText('Génesis'));
    fireEvent.change(screen.getByPlaceholderText(/buscar libro/i), {
      target: { value: 'Gén' },
    });

    expect(screen.getByText('Génesis')).toBeInTheDocument();
    expect(screen.queryByText('Éxodo')).not.toBeInTheDocument();
  });

  it('fetches and displays chapters when a book is selected', async () => {
    const mockBooks = [{ id: 1, name: 'Génesis' }];
    const mockChapters = [
      { id: 101, reference: 'Génesis 1' },
      { id: 102, reference: 'Génesis 2' },
    ];

    getReinaValeraBooks.mockResolvedValueOnce({ data: mockBooks });
    getBookChapters.mockResolvedValueOnce({ data: mockChapters });

    render(<ReinaValeraBooks />);

    await waitFor(() => screen.getByText('Génesis'));
    fireEvent.click(screen.getByText('Génesis'));

    await waitFor(() => screen.getByText('Génesis 1'));
    expect(screen.getByText('Génesis 2')).toBeInTheDocument();
  });

  it('fetches and displays verses when a chapter is selected', async () => {
    const mockChapters = [{ id: 101, reference: 'Génesis 1' }];
    const mockVerses = [
      { id: 1001, reference: 'Génesis 1:1' },
      { id: 1002, reference: 'Génesis 1:2' },
    ];

    getBookChapters.mockResolvedValueOnce({ data: mockChapters });
    getChapterVerses.mockResolvedValueOnce({ data: mockVerses });

    render(<ReinaValeraBooks />);

    fireEvent.click(screen.getByText('Génesis 1'));

    await waitFor(() => screen.getByText('Génesis 1:1'));
    expect(screen.getByText('Génesis 1:2')).toBeInTheDocument();
  });

  it('fetches and displays selected verses text in modal', async () => {
    const mockVerses = [{ id: 1001, reference: 'Génesis 1:1' }];
    const mockText = { data: { content: '<p>En el principio creó Dios los cielos y la tierra.</p>' } };

    getChapterVerses.mockResolvedValueOnce({ data: mockVerses });
    getVerseText.mockResolvedValueOnce(mockText);

    render(<ReinaValeraBooks />);

    fireEvent.click(screen.getByText('Génesis 1:1'));
    fireEvent.click(screen.getByText(/Buscar versículo/i));

    await waitFor(() => screen.getByText(/En el principio creó Dios los cielos/i));
  });
});