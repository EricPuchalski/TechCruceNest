import { X } from "lucide-react";
import { type FormEvent, useState } from "react";

import {
  GOOGLE_AUTH_URL,
  signIn,
  signUp,
} from "../../services/auth/auth.service";
import { getErrorMessage } from "../../utils/ui";
import type { AuthUser } from "../../types/auth/auth";
import styles from "./AuthDialog.module.css";

export type AuthMode = "sign-in" | "sign-up";

interface AuthDialogProps {
  mode: AuthMode;
  externalErrorMessage?: string;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onSuccess: (user: AuthUser) => void;
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21.805 12.23c0-.77-.069-1.508-.198-2.215H12v4.19h5.487a4.693 4.693 0 0 1-2.037 3.08v2.558h3.3c1.932-1.78 3.055-4.4 3.055-7.613Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.074-.915 6.766-2.479l-3.3-2.558c-.916.614-2.087.977-3.466.977-2.663 0-4.92-1.798-5.727-4.215H2.86v2.639A9.998 9.998 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.273 13.725A5.996 5.996 0 0 1 5.953 12c0-.599.104-1.18.32-1.725V7.636H2.86A9.998 9.998 0 0 0 2 12c0 1.612.386 3.138 1.06 4.364l3.213-2.639Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.06c1.502 0 2.85.516 3.911 1.53l2.934-2.934C17.069 2.997 14.755 2 12 2A9.998 9.998 0 0 0 2.86 7.636l3.413 2.639C7.08 7.858 9.337 6.06 12 6.06Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AuthDialog({
  mode,
  externalErrorMessage,
  onClose,
  onModeChange,
  onSuccess,
}: AuthDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const visibleErrorMessage = errorMessage || externalErrorMessage;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response =
        mode === "sign-in"
          ? await signIn({ email, password })
          : await signUp({ name, email, password });

      onSuccess(response.user);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={`icon-button ${styles.close}`}
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className={styles.header}>
          <span className={styles.eyebrow}>
            {mode === "sign-in" ? "Tu cuenta" : "Registro"}
          </span>
          <h2 id="auth-dialog-title">
            {mode === "sign-in"
              ? "Inicia sesion para guardar favoritos"
              : "Crea tu cuenta para seguir productos"}
          </h2>
          <p>
            Tu cuenta te permite marcar favoritos y recibir notificaciones en
            actualizaciones de precio!
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {mode === "sign-up" ? (
            <label className={styles.field}>
              <span>Nombre</span>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Tu nombre"
              />
            </label>
          ) : null}

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo 8 caracteres"
              minLength={mode === "sign-up" ? 8 : 1}
              required
            />
          </label>

          {visibleErrorMessage ? (
            <p className={styles.formError}>{visibleErrorMessage}</p>
          ) : null}

          <button
            type="submit"
            className={`primary-button ${styles.submit}`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Procesando..."
              : mode === "sign-in"
                ? "Iniciar sesion"
                : "Crear cuenta"}
          </button>

          {mode === "sign-in" ? (
            <a className={styles.googleButton} href={GOOGLE_AUTH_URL}>
              <GoogleLogo />
              <span>Continuar con Google</span>
            </a>
          ) : null}
        </form>

        <div className={styles.footer}>
          <span>
            {mode === "sign-in"
              ? "Todavia no tienes cuenta?"
              : "Ya tienes una cuenta?"}
          </span>
          <button
            type="button"
            className="text-button"
            onClick={() =>
              onModeChange(mode === "sign-in" ? "sign-up" : "sign-in")
            }
          >
            {mode === "sign-in" ? "Registrarme" : "Iniciar sesion"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthDialog;
