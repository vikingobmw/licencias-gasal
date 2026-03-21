import { getLicencias, getProductos } from './actions';
import AdminClient from './AdminClient';
import { Toaster } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const licencias = await getLicencias();
  const productos = await getProductos();

  return (
    <>
      <Toaster position="top-right" />
      <AdminClient licencias={licencias} productos={productos} />
    </>
  );
}
