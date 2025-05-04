import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@sassy/ui/button";

export function AuthShowcase() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <SignedIn>
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-2xl">
            <span>Logged in</span>
          </p>
          <UserButton />
        </div>
      </SignedIn>
      {/* 
      <SignedOut>
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-2xl">
            <span>Not signed in</span>
          </p>
          <div className="flex gap-4">
            <SignInButton mode="modal">
              <Button size="lg">Sign in</Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button size="lg" variant="outline">
                Sign up
              </Button>
            </SignUpButton>
          </div>
        </div>
      </SignedOut> */}
    </div>
  );
}
