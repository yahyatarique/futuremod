import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardFooter,
  FormField,
  Input,
} from "@futuremod/ui";
import { useSession } from "../auth/SessionContext";
import { GoogleSignInButton } from "../auth/GoogleSignInButton";
import { ThemeToggle } from "../theme/ThemeToggle";

export function SignupPage() {
  const { user, loading, signUp } = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await signUp(name, email, password);
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    if (res.needsConfirmation) { setNeedsConfirmation(true); return; }
    navigate("/dashboard", { replace: true });
  };

  if (needsConfirmation) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold tracking-tight">FutureMod</span>
        </div>
        <Card className="w-full max-w-sm shadow-md">
          <CardContent className="pt-6 pb-2 text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-primary">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <p className="font-semibold text-foreground">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We sent a link to <strong>{email}</strong>. Click it to activate your account.
            </p>
          </CardContent>
          <CardFooter className="justify-center pb-5">
            <Link to="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      {/* Wordmark */}
      <div className="mb-8 text-center">
        <span className="text-3xl font-bold tracking-tight">FutureMod</span>
        <p className="mt-1 text-sm text-muted-foreground">Build your page. Share it with the world.</p>
      </div>

      <Card className="w-full max-w-sm shadow-md">
        <CardContent className="space-y-3 pt-6">
          {/* Google — primary CTA */}
          <GoogleSignInButton />

          {/* Divider */}
          <div className="relative flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or sign up with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField label="Your name">
              <Input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
            </FormField>
            <FormField label="Email" required>
              <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <FormField label="Password" hint="At least 8 characters." required>
              <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormField>
            <Button type="submit" className="w-full" variant="outline" disabled={submitting}>
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pb-5">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
