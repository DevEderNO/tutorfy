import { Component, type ReactNode } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onSuccess: (credential: string) => void;
  onError: () => void;
}

function GoogleButton({ disabled, onSuccess, onError }: GoogleSignInButtonProps) {
  const handleSuccess = (response: CredentialResponse) => {
    if (response.credential) onSuccess(response.credential);
  };

  return (
    <div className={`relative w-full h-[44px] rounded-2xl overflow-hidden${disabled ? " opacity-50 pointer-events-none" : ""}`}>
      {/* Visual layer */}
      <div className="absolute inset-0 flex items-center pointer-events-none rounded-2xl overflow-hidden bg-[#131314] border border-white/10 hover:border-white/25 transition-all">
        <span className="flex items-center justify-center px-3.5 bg-white self-stretch">
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        </span>
        <span className="flex-1 text-center text-sm font-semibold text-white/90 tracking-wide">
          Continuar com Google
        </span>
      </div>

      {/* Google Login iframe — nearly transparent but visible enough for GSI to attach click listener */}
      <div className="absolute inset-0 opacity-[0.005] [&>div]:h-full [&>div>div]:h-full [&_iframe]:!w-full [&_iframe]:!h-full">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={onError}
          theme="filled_black"
          shape="rectangular"
        />
      </div>
    </div>
  );
}

interface ErrorBoundaryState { hasError: boolean }

class GoogleButtonErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  return (
    <GoogleButtonErrorBoundary>
      <GoogleButton {...props} />
    </GoogleButtonErrorBoundary>
  );
}
