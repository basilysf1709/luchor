"use client";

import { FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthMode = "sign-in" | "sign-up";

interface AuthCardProps {
  onAuthenticated?: () => Promise<void> | void;
}

export function AuthCard({ onAuthenticated }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!normalizedEmail || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    if (isSignUp && !trimmedName) {
      setErrorMessage("Name is required for sign up.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = isSignUp
        ? await authClient.signUp.email({
            name: trimmedName,
            email: normalizedEmail,
            password,
          })
        : await authClient.signIn.email({
            email: normalizedEmail,
            password,
          });

      if (response.error) {
        setErrorMessage(response.error.message ?? "Authentication failed.");
        return;
      }

      setStatusMessage(
        isSignUp
          ? "Account created. You are now signed in."
          : "Signed in successfully.",
      );
      setPassword("");
      await onAuthenticated?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Authentication failed.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-md border border-screamin-green-200 bg-white p-6 shadow-sm">
      <div className="mb-6 space-y-1">
        <h2 className="text-2xl font-bold text-screamin-green-900">
          {isSignUp ? "Create your account" : "Sign in to Luchor"}
        </h2>
        <p className="text-sm text-screamin-green-700">
          {isSignUp
            ? "Use email and password to get started."
            : "Access your workspace with your email and password."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignUp ? (
          <div className="space-y-1">
            <label className="text-sm font-medium text-screamin-green-900">
              Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ada Lovelace"
              autoComplete="name"
              disabled={isSubmitting}
            />
          </div>
        ) : null}

        <div className="space-y-1">
          <label className="text-sm font-medium text-screamin-green-900">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-screamin-green-900">
            Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            disabled={isSubmitting}
          />
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}
        {statusMessage ? (
          <p className="text-sm text-screamin-green-800">{statusMessage}</p>
        ) : null}

        <Button
          type="submit"
          className="w-full bg-screamin-green-800 text-white hover:bg-screamin-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Please wait..."
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          className="text-sm text-screamin-green-800 underline underline-offset-4 hover:text-screamin-green-900"
          onClick={() => {
            setMode(isSignUp ? "sign-in" : "sign-up");
            setErrorMessage(null);
            setStatusMessage(null);
          }}
          disabled={isSubmitting}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

