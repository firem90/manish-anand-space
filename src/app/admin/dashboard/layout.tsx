import { redirect } from "next/navigation";
import { verifySession, clearSession } from "@/lib/admin";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await verifySession();

  if (!isAuth) {
    redirect("/admin");
  }

  const handleLogout = async () => {
    "use server";
    await clearSession();
    redirect("/admin");
  };

  return (
    <div className="w-full flex md:flex-row flex-col gap-6 md:gap-8 py-4 w-full mx-auto">
      <aside className="md:w-48 shrink-0 flex flex-col gap-6">
        <div>
          <h2 className="font-bold text-xl mb-4 font-mono text-accent">Admin</h2>
        </div>
        <nav className="flex flex-col gap-2 font-mono text-sm">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2.5 rounded-sm hover:bg-muted/10 transition-colors"
          >
            Blog Posts
          </Link>
          <Link
            href="/admin/dashboard/papers"
            className="px-4 py-2.5 rounded-sm hover:bg-muted/10 transition-colors"
          >
            Paper Rack
          </Link>
          <Link
            href="/admin/dashboard/til"
            className="px-4 py-2.5 rounded-sm hover:bg-muted/10 transition-colors"
          >
            TIL Notes
          </Link>
          <Link
            href="/admin/dashboard/diagrams"
            className="px-4 py-2.5 rounded-sm hover:bg-muted/10 transition-colors"
          >
            Diagrams
          </Link>
          <Link
            href="/admin/dashboard/books"
            className="px-4 py-2.5 rounded-sm hover:bg-muted/10 transition-colors"
          >
            Books
          </Link>
        </nav>
        
        <div className="mt-auto pt-8 border-t border-muted/20">
          <form action={handleLogout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm font-mono text-muted hover:text-red-400 transition-colors w-full px-4"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
