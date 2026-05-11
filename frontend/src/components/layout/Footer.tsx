import { Mail } from "lucide-react";
import styles from "./Footer.module.css";

interface FooterProps {
  onOpenFavorites: () => void;
}

function GithubLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Footer({ onOpenFavorites }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <h3>TechCruce</h3>
          <p>
            Un espacio para explorar hardware, comparar tiendas y guardar los
            productos que de verdad te importan.
          </p>
        </div>

        <div>
          <h3>Secciones</h3>
          <a href="#catalogo">Catálogo</a>
          <button
            type="button"
            className={styles.linkButton}
            onClick={onOpenFavorites}
          >
            Favoritos
          </button>
        </div>

        <div>
          <h3>Contacto</h3>
          <div className={styles.socials}>
            <a
              className={`${styles.socialLink} ${styles.mail}`}
              href="mailto:eric.puchalski1@gmail.com"
              aria-label="Enviar email"
            >
              <Mail size={20} />
            </a>
            <a
              className={`${styles.socialLink} ${styles.github}`}
              href="https://github.com/EricPuchalski"
            >
              <GithubLogo />
            </a>
            <a
              className={`${styles.socialLink} ${styles.linkedin}`}
              href="https://www.linkedin.com/in/eric-puchalski/"
            >
              <LinkedinLogo />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>&copy; 2026 TechCruce. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}

export default Footer;
