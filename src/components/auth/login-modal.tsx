// src/components/auth/login-modal.tsx
'use client';

import { useState, type Dispatch, type SetStateAction, type FC } from 'react'; // Added FC type
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Star, Info, X, AlertCircle } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

interface LoginModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

// Inline SVG for Google Icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.5 512 0 401.5 0 265.8 0 129.5 110.3 19.8 244 19.8c66.8 0 124 25.5 165.7 65.4l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H244v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
  </svg>
);

export const LoginModal: FC<LoginModalProps> = ({ isOpen, setIsOpen }) => {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and signup
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    setError(null);
    try {
      await signInWithGoogle();
      toast({ title: 'Signed In', description: 'Successfully signed in with Google.' });
      setIsOpen(false); // Close modal on success
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingEmail(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast({ title: 'Account Created', description: 'Successfully created your account and signed in.' });
      } else {
        await signInWithEmail(email, password);
        toast({ title: 'Signed In', description: 'Successfully signed in with Email.' });
      }
      setIsOpen(false); // Close modal on success
    } catch (err: any) {
      let friendlyError = 'An unexpected error occurred. Please try again.';
      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            friendlyError = 'Please enter a valid email address.';
            break;
          case 'auth/user-not-found':
          case 'auth/invalid-credential': // Catch invalid login credential error
            friendlyError = 'Incorrect email or password. Please try again.';
            break;
          case 'auth/wrong-password':
            friendlyError = 'Incorrect password. Please try again.';
            break;
          case 'auth/email-already-in-use':
            friendlyError = 'This email is already in use. Try logging in?';
            break;
          case 'auth/weak-password':
            friendlyError = 'Password should be at least 6 characters.';
            break;
          default:
            friendlyError = `Login failed: ${err.message}`;
        }
      }
      setError(friendlyError); // Set the error message
      console.error(err);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setError(null);
      setEmail('');
      setPassword('');
      setIsSignUp(false);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Updated styling for dark theme */}
      <DialogContent className="sm:max-w-[450px] bg-card border-border/50 rounded-lg shadow-xl text-card-foreground">
        <DialogHeader className="text-center pt-8 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {isSignUp ? 'Create your Account' : 'Welcome Back!'}
          </DialogTitle>
          <DialogDescription className="pt-1 text-muted-foreground">
            {isSignUp ? 'Join DishWish today!' : 'Log in to access your recipes.'}
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-6 space-y-4">
          {/* Social Logins */}
          <Button
            variant="outline"
            className="w-full justify-center border-border hover:bg-accent hover:text-accent-foreground" // Adjusted hover for dark
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle || isLoadingApple || isLoadingEmail}
          >
            {isLoadingGoogle ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Label htmlFor="email-login" className="text-foreground/90">Email</Label>
              <Input
                id="email-login"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 bg-input border-border focus:border-primary focus:ring-primary/50"
                disabled={isLoadingGoogle || isLoadingApple || isLoadingEmail}
              />
            </div>
            {/* Show password field only for email login/signup */}
            <div>
              <Label htmlFor="password-login" className="text-foreground/90">Password</Label>
              <Input
                id="password-login"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6} // Basic validation
                className="mt-1 bg-input border-border focus:border-primary focus:ring-primary/50"
                disabled={isLoadingGoogle || isLoadingApple || isLoadingEmail}
              />
              {isSignUp && <p className="mt-1 text-xs text-muted-foreground">Minimum 6 characters required.</p>}
            </div>

            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoadingGoogle || isLoadingApple || isLoadingEmail}>
              {isLoadingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSignUp ? 'Create account' : 'Continue with Email'}
            </Button>
          </form>

          {/* Toggle between Login and Sign Up */}
          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Button variant="link" className="p-0 h-auto text-primary hover:underline" onClick={() => { setIsSignUp(!isSignUp); setError(null); }}>
              {isSignUp ? 'Log in' : 'Sign up'}
            </Button>
          </p>

        </div>

        {/* Close button added manually for better control */}

      </DialogContent>
    </Dialog>
  );
};
