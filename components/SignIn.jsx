import { useState } from "react";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import AuthForm from "./AuthForm";
import toast from "react-hot-toast";
import { getAuthErrorMessage, logAppError } from "../lib/userFacingError";
import { ensureUserProfile } from "../lib/ensureUserProfile";

export default function SignIn({ setIsSignUp }) {
  const router = useRouter();
  const [errorLabel, setErrorLabel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorLabel(false);
    setErrorMessage("");
    setIsLoading(true);

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    if (!email || !password) {
      setErrorLabel(true);
      setErrorMessage("Email and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await ensureUserProfile(userCredential.user);
      toast.success("Signed in successfully!");
      router.push("/home");
    } catch (authError) {
      console.error("Authentication error:", authError.code, authError.message);
      handleAuthError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const profile = await ensureUserProfile(result.user);
      toast.success(`Welcome back, ${profile?.username || "friend"}!`);
      router.push("/home");
    } catch (error) {
      logAppError("Google sign-in", error);
      toast.error(
        getAuthErrorMessage(error, "Google sign-in failed. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error) => {
    setErrorLabel(true);
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        setErrorMessage("Incorrect email or password. Please try again.");
        break;
      case "auth/invalid-email":
        setErrorMessage("Invalid email format.");
        break;
      case "auth/user-disabled":
        setErrorMessage("This account has been disabled.");
        break;
      case "auth/too-many-requests":
        setErrorMessage(
          "Too many attempts. Account temporarily locked. Please try again later or reset your password."
        );
        break;
      default:
        setErrorMessage("Sign in failed. An unexpected error occurred.");
        console.error(`Unhandled Sign In Error (${error.code}):`, error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <h1 className="text-3xl font-bold text-textprimary mb-6 font-poppins">
        SIGN IN
      </h1>
      <AuthForm
        onSubmit={handleSignIn}
        fields={[
          { name: "email", type: "email", placeholder: "Email Address" },
          { name: "password", type: "password", placeholder: "Password" },
        ]}
        buttonText="Sign In"
        errorLabel={errorLabel}
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
      <div className="my-4 text-center text-textsecondary text-xs w-full max-w-sm">
        OR
      </div>
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full max-w-sm bg-secondary text-textprimary py-3 rounded-md mb-4 border border-secondary-light font-poppins flex items-center justify-center gap-2 hover:bg-secondary-light disabled:opacity-70 transition-colors"
      >
        <FcGoogle className="text-xl" /> Continue With Google
      </button>
      <p className="text-textsecondary font-poppins text-sm">
        Don’t have an account?{" "}
        <button
          className="text-accent hover:text-accent-hover font-semibold underline"
          onClick={() => setIsSignUp(true)}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}
