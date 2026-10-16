import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/authSchemas.js";
import   api from "../api.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const clearChats = useChatStore((state) => state.clearChats);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(formData) {
    setServerError("");

    try {
      const response = await api.post("/user/login", formData);
      const { name, age, email } = response.data;
      clearChats();
      setUser({ name, age, email });
      navigate("/", { replace: true });
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    }
  }

  return (
    <main className="mx-4 mt-16 max-w-md rounded-3xl border border-[#3f3f3f] bg-[#252525] p-8 shadow-xl sm:mx-auto">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-[#f4f4f4]">
        Log in
      </h1>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-[#c5c5c5]">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-[#4a4a4a] bg-[#303030] p-3 text-[#ececec] focus:border-[#a8a8a8] focus:outline-none"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-[#f87171]">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm text-[#c5c5c5]"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#4a4a4a] bg-[#303030] p-3 pr-12 text-[#ececec] focus:border-[#a8a8a8] focus:outline-none"
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#a3a3a3] transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={20} strokeWidth={1.8} />
              ) : (
                <Eye size={20} strokeWidth={1.8} />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-sm text-[#f87171]">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-[#f87171]">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-white p-3 font-medium text-[#171717] hover:bg-[#e5e5e5] disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[#b4b4b4]">
        New user?{" "}
        <Link
          to="/signup"
          className="text-[#ececec] underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </main>
  );
}
