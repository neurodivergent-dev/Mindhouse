"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(
    searchParams.get("mode") !== "register",
  );
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
      const errorMessage =
        error instanceof Error ? error.message : t("genericError");
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
      const errorMessage =
        error instanceof Error ? error.message : t("googleSignInFailed");
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {tCommon("appName")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("tagline")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0 glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? t("welcome") : t("createAccount")}
              </CardTitle>
              <CardDescription>
                {isLogin ? t("loginDescription") : t("registerDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={(e) => {
                  void handleSubmit(e);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">{tCommon("email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={tCommon("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">
                        {t("passwordMismatch")}
                      </p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-sm text-green-500 mt-1">
                        {t("passwordMatch")}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={
                    isLoading ||
                    (!isLogin &&
                      (!confirmPassword || password !== confirmPassword))
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>
                        {isLogin ? t("signingIn") : t("signingUp")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
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
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
              )}

              <Separator />

              <Button
                variant="outline"
                className="w-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all"
                onClick={() => {
                  void handleGoogleSignIn();
                }}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>{t("signingInWithGoogle")}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="h-4 w-4"
                    >
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
                    <span>
                      {isLogin ? t("signInWithGoogle") : t("signUpWithGoogle")}
                    </span>
                  </div>
                )}
              </Button>

              <Separator />

              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all"
                  onClick={handleGuestMode}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t("continueAsGuest")}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 transition-all"
                  onClick={handleLiveDemo}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {t("liveDemo")}
                </Button>
              </div>

              <div className="text-center text-sm">
                {isLogin ? (
                  <p>
                    {t("noAccount")}{" "}
                    <button
                      onClick={() => handleToggleMode(false)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {t("registerNow")}
                    </button>
                  </p>
                ) : (
                  <p>
                    {t("hasAccount")}{" "}
                    <button
                      onClick={() => handleToggleMode(true)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {t("signInNow")}
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <motion.div
            className="text-center p-4 rounded-lg border-gradient-question bg-white dark:bg-gray-800"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <GraduationCap className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {t("aiLearning")}
            </p>
          </motion.div>
          <motion.div
            className="text-center p-4 rounded-lg border-gradient-question bg-white dark:bg-gray-800"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Target className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {t("personalized")}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const tCommon = useTranslations("Common");

  return (
    <Suspense fallback={<div>{tCommon("loading")}</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
