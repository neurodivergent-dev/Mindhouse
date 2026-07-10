"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, CheckCircle, Brain, Loader2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { resetPassword } from "@/lib/supabase";
import { useTranslations } from "next-intl";

const inputClassName =
  "pl-10 h-11 bg-white/60 dark:bg-white/5 border-white/20 dark:border-white/10 rounded-xl text-sm font-medium";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: t("emailSentToastTitle"),
        description: t("emailSentToastDescription"),
      });
    } catch (error) {
      toast({
        title: tCommon("error"),
        description: error instanceof Error ? error.message : t("resetEmailFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pageShell =
    "min-h-screen bg-[#f5f5f7] dark:bg-transparent dark:!bg-none flex items-center justify-center px-4 py-8";

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
              <div className="w-full relative z-10 p-6 md:p-8 space-y-5 text-center">
                <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
                  {t("emailSentTitle")}
                </h2>
                <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">
                  {t("emailSentDescription", { email })}
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/20 text-sm font-semibold"
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
            {t("resetPasswordTitle")}
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
                  {t("resetPasswordHeading")}
                </h2>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">
                  {t("resetPasswordDescription")}
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
                      className={inputClassName}
                      required
                    />
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
                      <span>{t("sending")}</span>
                    </div>
                  ) : (
                    <span>{t("sendResetLink")}</span>
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
