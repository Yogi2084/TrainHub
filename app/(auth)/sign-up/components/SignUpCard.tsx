"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { auth } from "@/lib/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { nameSchema } from "@/lib/extras/schemas/name";
import { emailSchema } from "@/lib/extras/schemas/email";
import { passwordSchema } from "@/lib/extras/schemas/password";
import { Caption } from "@/components/ui/caption";
import MatrixText from "./MatrixText";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { useRouter } from "next/navigation";
// import { FcGoogle } from "react-icons/fc";
// import { createAuthClient } from "better-auth/client";
// import { clientUrl, serverUrl } from "@/lib/environment";

export default function SignUpForm() {
  const router = useRouter();
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  

  const { Field, handleSubmit, Subscribe } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      termsAndConditionsChecked: false,
    },
    onSubmit: async (value) => {
      const { name, email, password } = value.value;
      const { error } = await auth.signUp.email({
        name,
        email,
        password,
        callbackURL: `/dashboard`,
      });

      if (error) {
        setSignUpError("Unable to sign up currently");
        console.error(error);
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
  //     setSignUpError("Unable to sign up currently");
  //     console.error(data.error);
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
      <MatrixText className="mt-14" />
      <div className="flex flex-col items-center justify-start p-4">
        <Card className="mx-auto w-full max-w-md bg-[--color-card] text-[--color-card-foreground] border border-[--color-border] shadow-md rounded-xl transition-colors duration-300">
          <CardHeader className="px-6 text-center">
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="flex flex-col items-stretch gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
            >
              <div className="w-full px-3 pt-6">
                {/* Name Field */}
                <Field
                  name="name"
                  validators={{
                    onSubmit: (value) => {
                      const { error } = nameSchema.safeParse(value.value);
                      return error?.errors[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div>
                      <fieldset className="border border-[--color-border] rounded-md px-3 pb-2 focus-within:ring-1 focus-within:ring-[--color-ring] transition">
                        <legend className="text-[--color-primary] text-sm font-medium px-1">
                          Name
                        </legend>
                        <input
                          type="text"
                          id="name"
                          placeholder="John Doe"
                          className="w-full bg-transparent text-[--color-foreground] text-lg px-2 rounded-md focus:outline-none"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
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
                      <fieldset className="border border-[--color-border] rounded-md px-3 pb-2 mt-4 focus-within:ring-1 focus-within:ring-[--color-ring] transition">
                        <legend className="text-[--color-primary] text-sm font-medium px-1">
                          Email
                        </legend>
                        <input
                          type="text"
                          id="email"
                          placeholder="johndoe@gmail.com"
                          className="w-full bg-transparent text-[--color-foreground] text-lg px-2 rounded-md focus:outline-none"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
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
                <Field
                  name="password"
                  validators={{
                    onSubmit: (value) => {
                      const { error } = passwordSchema.safeParse(value.value);
                      return error?.errors[0]?.message;
                    },
                  }}
                >
                  {(field) => (
                    <div className="relative">
                      <fieldset className="border border-[--color-border] rounded-md px-3 pb-2 mt-4 focus-within:ring-1 focus-within:ring-[--color-ring] transition">
                        <legend className="text-[--color-primary] text-sm font-medium px-1">
                          Password
                        </legend>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          placeholder="********"
                          className="w-full bg-transparent text-[--color-foreground] text-lg px-2 rounded-md focus:outline-none pr-10"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
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

                {/* Terms Checkbox */}
                <Field
                  name="termsAndConditionsChecked"
                  validators={{
                    onSubmit: (value) =>
                      value.value
                        ? undefined
                        : "You must agree to the terms and conditions",
                  }}
                >
                  {(field) => (
                    <div className="flex gap-1 items-center justify-center mt-4 text-sm text-[--color-foreground]">
                      <input
                        type="checkbox"
                        className="mt-0.5 justify-center accent-[--color-ring]"
                        checked={field.state.value}
                        onChange={(e) => field.handleChange(e.target.checked)}
                        onBlur={field.handleBlur}
                        required
                        id="terms"
                      />
                      <label htmlFor="terms">
                        I agree to the terms and conditions
                      </label>
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
                      Sign Up
                    </Button>
                  )}
                </Subscribe>

                {/* <p className="text-center text-sm text-[--color-primary] mt-4">
                  Or <br /> Sign Up With
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

                <p className="text-center text-sm mt-4 text-[var(--muted-foreground)]">
                  Already have an account?{" "}
                  <Link
                    href="/log-in"
                    className="text-[var(--foreground)] hover:underline underline-offset-2"
                  >
                    Log In
                  </Link>
                </p>

                {signUpError && (
                  <Caption variant="error">{signUpError}</Caption>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
