import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Importa jest-dom para extender expect
import Login from '../Login'; // Asegúrate de que la ruta sea correcta
import { signInWithPopup } from 'firebase/auth';
import { describe, it,test, expect } from 'vitest';
import { vi } from 'vitest'; // Importa vi desde vitest

// Mock de las funciones de Firebase usando vi
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth'); // Importa las funciones originales
  return {
    ...actual, // Mantén las funciones originales
    signInWithPopup: vi.fn(), // Mockea solo signInWithPopup
    getAuth: vi.fn(() => ({})), // Mockea getAuth
    GoogleAuthProvider: vi.fn(() => ({})), // Mockea GoogleAuthProvider
    GithubAuthProvider: vi.fn(() => ({})), // Mockea GithubAuthProvider
  };
});

describe('Login Component', () => {
  // Prueba 1: Verificar que el componente se renderice correctamente
  it('renders the login component', () => {
    render(<Login />);

    // Verificar que el título esté presente (usando un selector más específico)
    const titleElement = screen.getByRole('heading', { name: /Biblia Reina Valera/i });
    expect(titleElement).toBeInTheDocument();

    // Verificar que los botones de Google y GitHub estén presentes
    expect(screen.getByText(/Iniciar con Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Iniciar con GitHub/i)).toBeInTheDocument();
  });

  // Prueba 2: Verificar que el botón de Google llame a la función de login
  test('calls handleGoogleSignIn when Google button is clicked', () => {
    render(<Login />);

    // Simular clic en el botón de Google
    const googleButton = screen.getByText(/Iniciar con Google/i);
    fireEvent.click(googleButton);

    // Verificar que la función de login se haya llamado
    expect(signInWithPopup).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
  });

  // Prueba 3: Verificar que el botón de GitHub llame a la función de login
  it('calls handleGithubSignIn when GitHub button is clicked', () => {
    render(<Login />);

    // Simular clic en el botón de GitHub
    const githubButton = screen.getByText(/Iniciar con GitHub/i);
    fireEvent.click(githubButton);

    // Verificar que la función de login se haya llamado
    expect(signInWithPopup).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
  });
});