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

// Simple Google icon component
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path fill="currentColor" d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
  </svg>
);

// Simple Apple icon component
const AppleIcon = () => (
  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
    <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47c-1.34.03-1.77-.79-3.29-.79c-1.53 0-2 .77-3.27.82c-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51c1.28-.02 2.5.87 3.29.87c.78 0 2.26-1.07 3.81-.91c.65.03 2.47.26 3.64 1.98c-.09.06-2.17 1.28-2.15 3.81c.03 3.02 2.65 4.03 2.68 4.04c-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5c.13 1.17-.34 2.35-1.04 3.19c-.69.85-1.83 1.51-2.95 1.42c-.15-1.15.41-2.35 1.05-3.11Z" />
  </svg>
);

export const LoginModal: FC<LoginModalProps> = ({ isOpen, setIsOpen }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingApple, setIsLoadingApple] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    setError(null);
    try {
      await signInWithGoogle();
      toast({ title: 'Signed In', description: 'Successfully signed in with Google.' });
      setIsOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleAppleSignIn = async () => {
    // setIsLoadingApple(true);
    // setError(null);
    // try {
    //   // await signInWithApple(); // Not implemented yet
    //   toast({ title: 'Signed In', description: 'Successfully signed in with Apple.' });
    //   setIsOpen(false);
    // } catch (err) {
    //   setError('Failed to sign in with Apple. Please try again.');
    //   console.error(err);
    // } finally {
      setIsLoadingApple(false);
    // }
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
           // Add more specific Firebase error codes as needed
           default:
             friendlyError = `Login failed: ${err.message}`;
         }
       }
       setError(friendlyError);
       console.error(err);
     } finally {
       setIsLoadingEmail(false);
     }
  };

  // Reset state when modal opens/closes
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
           <Button
             variant="outline"
             className="w-full justify-center border-border hover:bg-accent hover:text-accent-foreground" // Adjusted hover for dark
             onClick={handleAppleSignIn}
              disabled={isLoadingGoogle || isLoadingApple || isLoadingEmail || true} // Disabled Apple Sign-In for now
           >
              {isLoadingApple ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
               <AppleIcon />
             )}
             Continue with Apple <span className='text-xs text-muted-foreground ml-1'>(Coming Soon)</span>
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
                  {/* <AlertTitle>Login Failed</AlertTitle> */}
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

         {/* Footer links */}
        <DialogFooter className="px-8 pb-8 pt-2 flex-col items-center space-y-3 border-t border-border/20">
          <p className="text-xs text-muted-foreground text-center mt-4">
              By continuing, you agree to our{' '}
              <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link> and{' '}
              <Link href="/terms" className="underline hover:text-primary">Terms of Use</Link>.
          </p>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};
