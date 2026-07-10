"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Play,
  GraduationCap,
  Brain,
  Users,
  Target,
  Loader2,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          throw error;
        }
        toast({
          title: t("loginSuccessTitle"),
          description: t("loginSuccessDescription"),
        });
        router.push("/landing");
      } else {
        if (password !== confirmPassword) {
          toast({
            title: tCommon("error"),
            description: t("passwordMismatchDescription"),
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          toast({
            title: tCommon("error"),
            description: t("passwordMinLength"),
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUpWithEmail(email, password);
        if (error) {
          throw error;
        }
        toast({
          title: t("registerSuccessTitle"),
          description: t("registerSuccessDescription"),
        });
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("genericError");
      toast({
        title: tCommon("error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("googleSignInFailed");
      toast({
        title: t("googleSignInFailedTitle"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestMode = () => {
    toast({
      title: t("guestModeTitle"),
      description: t("guestModeDescription"),
    });
    router.push("/landing");
  };

  const handleLiveDemo = () => {
    toast({
      title: t("liveDemoTitle"),
      description: t("liveDemoDescription"),
    });
    router.push("/demo");
  };

  const handleToggleMode = (newMode: boolean) => {
    setIsLogin(newMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            {tCommon("appName")}
          </h1>
          <p className="text-[#86868b] dark:text-[#a1a1a6] text-sm font-medium mt-1.5">
            {t("tagline")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="apple-glass-card">
            <div className="w-full relative z-10 p-6 md:p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {isLogin ? t("welcome") : t("createAccount")}
                </h2>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
                  {isLogin ? t("loginDescription") : t("registerDescription")}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  void handleSubmit(e);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
                  >
                    {tCommon("email")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b] dark:text-[#a1a1a6]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={tCommon("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
                  >
                    {t("password")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b] dark:text-[#a1a1a6]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]"
                    >
                      {t("confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b] dark:text-[#a1a1a6]" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-11 bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl text-sm font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{t("passwordMismatch")}</p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {t("passwordMatch")}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 text-sm font-semibold disabled:opacity-40"
                  disabled={
                    isLoading || (!isLogin && (!confirmPassword || password !== confirmPassword))
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isLogin ? t("signingIn") : t("signingUp")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{isLogin ? t("signIn") : t("signUp")}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              {isLogin && (
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
              )}

              <Separator className="bg-white/20 dark:bg-white/10" />

              <Button
                variant="outline"
                className="w-full h-11 rounded-xl bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-sm transition-all"
                onClick={() => {
                  void handleGoogleSignIn();
                }}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("signingInWithGoogle")}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.28,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                    </svg>
                    <span>{isLogin ? t("signInWithGoogle") : t("signUpWithGoogle")}</span>
                  </div>
                )}
              </Button>

              <Separator className="bg-white/20 dark:bg-white/10" />

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full h-11 rounded-xl text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-white/40 dark:hover:bg-white/5 font-medium text-sm transition-all"
                  onClick={handleGuestMode}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t("continueAsGuest")}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full h-11 rounded-xl text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-white/40 dark:hover:bg-white/5 font-medium text-sm transition-all"
                  onClick={handleLiveDemo}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t("liveDemo")}
                </Button>
              </div>

              <div className="text-center text-sm text-[#86868b] dark:text-[#a1a1a6]">
                {isLogin ? (
                  <p>
                    {t("noAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => handleToggleMode(false)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                    >
                      {t("registerNow")}
                    </button>
                  </p>
                ) : (
                  <p>
                    {t("hasAccount")}{" "}
                    <button
                      type="button"
                      onClick={() => handleToggleMode(true)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                    >
                      {t("signInNow")}
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 grid grid-cols-2 gap-4"
        >
          <div className="apple-glass-card hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <div className="p-4 text-center relative z-10">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {t("aiLearning")}
              </p>
            </div>
          </div>
          <div className="apple-glass-card hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <div className="p-4 text-center relative z-10">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mx-auto mb-2">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                {t("personalized")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
