"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { auth } from "@/lib/auth";
import { emailSchema } from "@/lib/extras/schemas/email";
import { Caption } from "@/components/ui/caption";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import MatrixText from "./MatrixText";
import { FiArrowLeft } from "react-icons/fi";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ModeToggle } from "@/components/ui/ModeToggle";
// import { FcGoogle } from "react-icons/fc";
// import { createAuthClient } from "better-auth/client";
// import { clientUrl, serverUrl } from "@/lib/environment";

export default function LogInForm() {
  const router = useRouter();
  const [logInError, setLogInError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { Field, handleSubmit, Subscribe } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value: { email, password } }) => {
      const { error } = await auth.signIn.email({
        email,
        password,
        callbackURL: `/dashboard`,
      });

      if (error) {
        setLogInError("Login failed. Please check your credentials.");
        return;
      }

      router.replace(`/dashboard`);
    },
  });

  // const authClient = createAuthClient({
  //   baseURL: serverUrl,
  //   basePath: "/api/auth",
  // });

  // const handleGoogleLogin = async () => {
  //   const data = await authClient.signIn.social({
  //     provider: "google",
  //     callbackURL: `${clientUrl}/dashboard`,
  //   });

  //   if (data?.error) {
  //     setLogInError("Login failed. Please try again.");
  //     return;
  //   }

  //   // Add manual session check after redirect
  //   setTimeout(async () => {
  //     const session = await authClient.getSession();
  //     if (session?.data?.user) {
  //       router.replace("/dashboard");
  //     }
  //   }, 2000); // Wait 2s after redirect
  // };

  return (
    <>
      <div className="absolute top-6 left-6 z-10">
        <Button asChild variant="outline" size="icon">
          <Link href="/" aria-label="Go to Homepage">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
      </div>
      <div className="absolute top-6 right-6 z-10">
        <ModeToggle />
      </div>
      <MatrixText className="mt-15 mb-5" />
      <div className="flex flex-col items-center justify-start min-h-screen p-3">
        <Card className="w-full max-w-md bg-[--color-card] text-[--color-card-foreground] border border-[--color-border] shadow-md rounded-xl transition-colors duration-300">
          <CardHeader className="px-6 text-center">
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>Log in to your account</CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="flex flex-col items-stretch gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="relative w-full max-w-md px-4 py-6">
                {/* Email Field */}
                <Field
                  name="email"
                  validators={{
                    onSubmit: (value) => {
                      const { error } = emailSchema.safeParse(value.value);
                      return error?.errors[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div>
                      <fieldset className="border border-[--color-border] rounded-md px-3 pb-2 focus-within:ring-1 focus-within:ring-[--color-ring] transition">
                        <legend className="text-[--color-primary] text-sm font-medium px-1">
                          Email
                        </legend>
                        <input
                          id="email"
                          type="email"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="johndoe@gmail.com"
                          className="w-full bg-transparent text-[var(--foreground)] text-lg px-2 rounded-md focus:outline-none"
                          required
                        />
                      </fieldset>
                      {field.state.meta.errors?.length > 0 && (
                        <div className="mt-1">
                          <Caption variant="error">
                            {field.state.meta.errors.join(" | ")}
                          </Caption>
                        </div>
                      )}
                    </div>
                  )}
                </Field>

                {/* Password Field */}
                <Field name="password">
                  {(field) => (
                    <div className="relative">
                      <fieldset className="border border-[--color-border] rounded-md px-3 pb-2 mt-4 focus-within:ring-1 focus-within:ring-[--color-ring] transition">
                        <legend className="text-[--color-primary] text-sm font-medium px-1">
                          Password
                        </legend>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="*********"
                          className="w-full bg-transparent text-[var(--foreground)] text-lg px-2 rounded-md focus:outline-none pr-10"
                          required
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-4 top-[60%] -translate-y-1/2 text-xl text-[var(--muted-foreground)] focus:outline-none"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </fieldset>
                      {field.state.meta.errors?.length > 0 && (
                        <div className="mt-1">
                          <Caption variant="error">
                            {field.state.meta.errors.join(" | ")}
                          </Caption>
                        </div>
                      )}
                    </div>
                  )}
                </Field>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-row justify-center items-center">
                    <input
                      type="checkbox"
                      className="mx-2 mt-0.5 justify-center accent-[--color-ring]"
                    />
                    <label className="text-sm text-[var(--muted-foreground)]">
                      Remember me
                    </label>
                  </div>
                  {/* <span className="text-sm text-[var(--foreground)] font-medium cursor-pointer hover:underline underline-offset-2">
                    Forgot password?
                  </span> */}
                </div>

                {/* Submit Button */}
                <Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="w-full mt-3"
                    >
                      {isSubmitting && <Spinner />}
                      Log In
                    </Button>
                  )}
                </Subscribe>

                {/* Error Display */}
                {logInError && (
                  <div className="text-center mt-2">
                    <Caption variant="error">{logInError}</Caption>
                  </div>
                )}

                {/* Social Login  */}
                {/* <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">
                  Or <br /> Sign In With
                </p>
                <div className="flex flex-row justify-center gap-3 mt-4">
                  <button
                    type="button"
                    className="flex items-center justify-center hover:cursor-pointer hover:bg-background h-10 px-4 w-full bg-[var(--background)] text-[var(--foreground)] rounded-md border border-[var(--border)] transition-colors duration-200"
                    onClick={handleGoogleLogin}
                  >
                    <div className="flex justify-center items-center w-5 h-5 mr-2">
                      <FcGoogle className="w-5 h-5" />
                    </div>
                    <span className="text-md text-[var(--foreground)]">
                      Google
                    </span>
                  </button>
                </div> */}

                {/* Sign Up Link */}
                <p className="text-center text-sm mt-6 text-[var(--muted-foreground)]">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="text-[var(--foreground)] hover:underline underline-offset-2"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
