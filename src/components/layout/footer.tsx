export default function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t bg-secondary/50">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          &copy; {new Date().getFullYear()} বাংলা গান। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </div>
    </footer>
  );
}
