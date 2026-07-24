import { useState } from "react";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import AuthForm from "./AuthForm";
import toast from "react-hot-toast";
import { getAuthErrorMessage, logAppError } from "../lib/userFacingError";
import {
  ensureUserProfile,
  isUsernameAvailable,
} from "../lib/ensureUserProfile";

export default function SignUp({ setIsSignUp }) {
  const router = useRouter();
  const [errorLabel, setErrorLabel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorLabel(false);
    setErrorMessage("");
    setIsLoading(true);

    const username = e.target.username.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    if (!username || !email || !password) {
      setErrorLabel(true);
      setErrorMessage("All fields are required.");
      setIsLoading(false);
      return;
    }

    if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setErrorLabel(true);
      setErrorMessage(
        "Username must be 3+ characters (letters, numbers, underscore only)."
      );
      setIsLoading(false);
      return;
    }

    let createdUser = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      createdUser = userCredential.user;

      const available = await isUsernameAvailable(username, createdUser.uid);
      if (!available) {
        await deleteUser(createdUser);
        createdUser = null;
        setErrorLabel(true);
        setErrorMessage("Username already taken.");
        return;
      }

      await ensureUserProfile(createdUser, username);
      toast.success("Account created successfully!");
      router.push("/home");
    } catch (authError) {
      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch (cleanupError) {
          console.error("Failed to clean up auth user after sign-up error:", cleanupError);
        }
      }
      console.error("Authentication error:", authError);
      handleAuthError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const profile = await ensureUserProfile(result.user);
      toast.success(`Welcome, ${profile?.username || "friend"}!`);
      router.push("/home");
    } catch (error) {
      logAppError("Google sign-up", error);
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
      case "auth/email-already-in-use":
        setErrorMessage("Email already in use. Try signing in.");
        break;
      case "auth/invalid-email":
        setErrorMessage("Invalid email format.");
        break;
      case "auth/weak-password":
        setErrorMessage("Password should be at least 6 characters.");
        break;
      default:
        setErrorMessage("Sign up failed. Please try again.");
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <h1 className="text-3xl font-bold text-textprimary mb-6 font-poppins">
        SIGN UP
      </h1>
      <AuthForm
        onSubmit={handleSignUp}
        fields={[
          { name: "username", type: "text", placeholder: "Username" },
          { name: "email", type: "email", placeholder: "Email Address" },
          { name: "password", type: "password", placeholder: "Password (min. 6 characters)" },
        ]}
        buttonText="Create Account"
        errorLabel={errorLabel}
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
      <div className="my-4 text-center text-textsecondary text-xs w-full max-w-sm">
        OR
      </div>
      <button
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className="w-full max-w-sm bg-secondary text-textprimary py-3 rounded-md mb-4 border border-secondary-light font-poppins flex items-center justify-center gap-2 hover:bg-secondary-light disabled:opacity-70 transition-colors"
      >
        <FcGoogle className="text-xl" />
        Continue With Google
      </button>
      <p className="text-textsecondary font-poppins text-sm">
        Already have an account?{" "}
        <button
          className="text-accent hover:text-accent-hover font-semibold underline"
          onClick={() => setIsSignUp(false)}
        >
          Sign In
        </button>
      </p>
    </div>
  );
}
