"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Brain,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { supabase, updatePassword } from "@/lib/supabase";
import { useTranslations } from "next-intl";

const inputClassName =
  "pl-10 pr-10 h-11 bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl backdrop-blur-sm text-sm font-medium";

const pageShell =
  "min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none flex items-center justify-center px-4 py-8";

function ResetPasswordContent() {
  const t = useTranslations("ResetPassword");
  const tCommon = useTranslations("Common");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if we have a valid reset token
  useEffect(() => {
    const checkResetToken = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If no session and no access token, the reset link is invalid
      if (!session && !searchParams.get("access_token")) {
        setIsValidToken(false);
      }
    };

    checkResetToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: t("error"),
        description: t("passwordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t("error"),
        description: t("passwordTooShort"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: t("success"),
        description: t("passwordUpdated"),
      });

      // Redirect to success page
      router.push("/auth/reset-success");
    } catch (error) {
      toast({
        title: t("error"),
        description:
          error instanceof Error
            ? error.message
            : t("errorUpdatingPassword"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className={pageShell}>
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div className="apple-glass-card">
              <div className="w-full relative z-10 p-6 md:p-8 space-y-4 text-center">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                  {t("invalidLink")}
                </h2>
                <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                  {t("invalidLinkDescription")}
                </p>
                <Button
                  onClick={() => router.push("/forgot-password")}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 text-sm font-semibold"
                >
                  {t("requestNewLink")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="w-full h-11 rounded-xl bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("backToLogin")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={pageShell}>
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="apple-glass-card">
              <div className="w-full relative z-10 p-6 md:p-8 space-y-4 text-center">
                <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
                  {t("passwordUpdatedSuccess")}
                </h2>
                <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                  {t("passwordUpdatedDescription")}
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 text-sm font-semibold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("goToLogin")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageShell}>
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
            {t("newPasswordSetup")}
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
                  {t("setNewPassword")}
                </h2>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
                  {t("setNewPasswordDescription")}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  void handleSubmit(e);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {t("newPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b] dark:text-[#a1a1a6]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClassName}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {t("confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b] dark:text-[#a1a1a6]" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("confirmPasswordPlaceholder")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClassName}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 text-sm font-semibold disabled:opacity-40"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("updating")}</span>
                    </div>
                  ) : (
                    <span>{t("updatePassword")}</span>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("backToLogin")}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ResetPasswordLoading() {
  const tCommon = useTranslations("Common");
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none flex items-center justify-center">
      <div className="flex items-center gap-2 text-[#86868b] dark:text-[#a1a1a6] text-sm">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <span>{tCommon("loading")}</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
