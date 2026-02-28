// Cambia a true para usar el servidor local (localhost)
// Cambia a false para usar el servidor de producción (desplegado)
const useLocal = true;

const API_HOST = useLocal
  ? 'http://localhost:8080'
  : 'http://159.65.255.4:8080';

export const environment = {
  apiUrl: API_HOST,
};
