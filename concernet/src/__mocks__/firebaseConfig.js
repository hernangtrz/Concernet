// __mocks__/firebaseConfig.js
const mockAuth = {
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn().mockReturnValue({
    add: jest.fn(),
    get: jest.fn().mockResolvedValue({
      docs: [
        { id: "1", data: () => ({ direccion: "Calle 1", precio: "$50000" }) },
        { id: "2", data: () => ({ direccion: "Calle 2", precio: "$75000" }) },
      ],
    }),
  }),
};

export const initializeApp = jest.fn();
export const getAuth = jest.fn(() => mockAuth);
export const getFirestore = jest.fn(() => mockFirestore);
export const signInWithEmailAndPassword = mockAuth.signInWithEmailAndPassword;
export const signOut = mockAuth.signOut;
export const collection = mockFirestore.collection;
export const getDocs = jest.fn();
