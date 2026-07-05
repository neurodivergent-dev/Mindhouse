"use client";

import React, { useState } from "react";
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
import { Mail, ArrowLeft, CheckCircle, Brain } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { resetPassword } from "@/lib/supabase";
import { useTranslations } from "next-intl";

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
        description:
          error instanceof Error ? error.message : t("resetEmailFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                  {t("emailSentTitle")}
                </CardTitle>
                <CardDescription>
                  {t("emailSentDescription", { email })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
            {t("resetPasswordTitle")}
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
                {t("resetPasswordHeading")}
              </CardTitle>
              <CardDescription>{t("resetPasswordDescription")}</CardDescription>
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
                  className="text-sm text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:px-3 hover:py-1 hover:rounded-lg transition-all duration-200"
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