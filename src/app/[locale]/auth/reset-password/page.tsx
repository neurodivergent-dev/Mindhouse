"use client";

import React, { useState, useEffect, Suspense } from "react";
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <Card className="shadow-xl border-0 glass-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {t("invalidLink")}
                </CardTitle>
                <CardDescription>
                  {t("invalidLinkDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => router.push("/forgot-password")}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {t("requestNewLink")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("backToLogin")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <Card className="shadow-xl border-0 glass-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {t("passwordUpdatedSuccess")}
                </CardTitle>
                <CardDescription>
                  {t("passwordUpdatedDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("goToLogin")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
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
            {t("newPasswordSetup")}
          </p>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0 glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {t("setNewPassword")}
              </CardTitle>
              <CardDescription>
                {t("setNewPasswordDescription")}
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
                  <Label htmlFor="password">{t("newPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("confirmPasswordPlaceholder")}
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
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("backToLogin")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ResetPasswordLoading() {
  const tCommon = useTranslations("Common");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
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
