import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] font-sans antialiased flex flex-col selection:bg-white selection:text-black">
      <PublicNavbar />
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
