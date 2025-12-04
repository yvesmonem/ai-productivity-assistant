import { create } from 'zustand';
import { User, Document } from './api';
import { authApi, documentsApi } from './api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
}

interface DocumentStore {
  documents: Document[];
  loading: boolean;
  fetchDocuments: () => Promise<void>;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    await authApi.login(email, password);
    const user = authApi.getCurrentUser();
    set({ user, isAuthenticated: !!user });
  },
  register: async (email: string, password: string, name?: string) => {
    await authApi.register(email, password, name);
    const user = authApi.getCurrentUser();
    set({ user, isAuthenticated: !!user });
  },
  logout: () => {
    authApi.logout();
    set({ user: null, isAuthenticated: false });
  },
  loadUser: () => {
    const user = authApi.getCurrentUser();
    const token = localStorage.getItem('token');
    set({ user, isAuthenticated: !!user && !!token });
  },
}));

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  loading: false,
  fetchDocuments: async () => {
    set({ loading: true });
    try {
      const documents = await documentsApi.getAll();
      set({ documents, loading: false });
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      set({ loading: false });
    }
  },
  addDocument: (doc: Document) => {
    set((state) => ({ documents: [doc, ...state.documents] }));
  },
  updateDocument: (id: string, updates: Partial<Document>) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    }));
  },
  removeDocument: (id: string) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },
}));

