export function Footer() {
  return (
    <footer className="border-line text-muted border-t px-6 py-10 text-xs uppercase tracking-[0.18em] sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span>Sush · Portfolio · 2026</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-fg">
            Github
          </a>
          <a href="#" className="hover:text-fg">
            LinkedIn
          </a>
          <a href="#" className="hover:text-fg">
            Whatsapp
          </a>
        </div>
      </div>
    </footer>
  );
}
