export default function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t bg-secondary/50">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          © ২০২৫ বাংলা গান । তথ্য ও মৌলিক লেখা সর্বসাধারণের জন্য উন্মুক্ত (
          <a
            href="https://creativecommons.org/publicdomain/zero/1.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            সিসি০
          </a>
          )। গানের স্বত্ব তার মূল স্বত্বাধিকারীর।
        </p>
      </div>
    </footer>
  );
}
