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

export function LoginPage() {
  const { user, loading, signIn } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await signIn(email, password);
    setSubmitting(false);
    if (!res.ok) { setError(res.error); return; }
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      {/* Wordmark */}
      <div className="mb-8 text-center">
        <span className="text-3xl font-bold tracking-tight">FutureMod</span>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to edit and publish your page.</p>
      </div>

      <Card className="w-full max-w-sm shadow-md">
        <CardContent className="space-y-3 pt-6">
          {/* Google — primary CTA */}
          <GoogleSignInButton />

          {/* Divider */}
          <div className="relative flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField label="Email" required>
              <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <FormField label="Password" required>
              <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormField>
            <Button type="submit" className="w-full" variant="outline" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pb-5">
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Create one free
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
