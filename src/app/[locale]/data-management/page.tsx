"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Cloud,
  Trash2,
  UserX,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  Shield,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import MobileNav from "@/components/mobile-nav";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DataBackupService } from "@/services/data-backup-service";
import { useTranslations } from "next-intl";

function DataManagementContent() {
  const t = useTranslations("DataManagement");
  const tCommon = useTranslations("Common");
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clearSuccess, setClearSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !authUser) {
      window.location.href = "/login";
    }
  }, [authLoading, authUser]);

  const handleClearData = async () => {
    try {
      setIsClearing(true);
      setClearSuccess("");

      // Clear real cloud data
      const success = await DataBackupService.clearAllCloudData();

      if (success) {
        setClearSuccess(t("clearSuccess"));
      } else {
        throw new Error(t("clearDataFailed"));
      }
    } catch {
      setClearSuccess("");
      setDeleteError(t("clearDataFailed"));
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setDeleteError("");

      // Delete account with real service
      const success = await DataBackupService.deleteAccount();

      if (success) {
        // Show success message briefly before redirect
        toast({
          title: t("accountDeletedTitle"),
          description: t("accountDeletedDescription"),
        });
      } else {
        throw new Error(t("deleteError"));
      }
    } catch {
      setDeleteError(t("deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{tCommon("loading")}</span>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t("loginRequired")}</p>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
              {t("login")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-transparent dark:!bg-none">
      {/* Navigation Header */}
      <MobileNav />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  {t("home")}
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/profile" className="hover:text-foreground transition-colors">
                  {t("profile")}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">{t("title")}</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <Link href="/profile">
              <Button
                variant="outline"
                size="sm"
                className="mb-4 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("backToProfile")}
              </Button>
            </Link>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
          </div>

          {/* Data Management Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Clear Cloud Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-gradient-question">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-orange-600" />
                    {t("clearCloudData")}
                  </CardTitle>
                  <CardDescription>{t("clearCloudDataDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400 leading-tight">
                        {t("clearWarning")}
                      </p>
                    </div>
                  </div>

                  {clearSuccess && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-600 dark:text-green-400">{clearSuccess}</p>
                      </div>
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={isClearing}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 w-full"
                      >
                        {isClearing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        {isClearing ? t("clearing") : t("clearAllCloudData")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmClearDataTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("confirmClearData")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            void handleClearData();
                          }}
                        >
                          {t("clear")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delete Account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-gradient-question">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserX className="w-5 h-5 text-red-600" />
                    {t("deleteAccount")}
                  </CardTitle>
                  <CardDescription>{t("deleteAccountDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400 leading-tight">
                        {t("deleteWarning")}
                      </p>
                    </div>
                  </div>

                  {deleteError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        disabled={isDeleting}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0 w-full"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <UserX className="w-4 h-4 mr-2" />
                        )}
                        {isDeleting ? t("deletingAccount") : t("deleteMyAccount")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteAccount")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("confirmDeleteAccount")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            void handleDeleteAccount();
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {t("deleteAccount")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="border-gradient-question">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {t("securityInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("encryptedStorage")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("secureCloud")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("gdprCompliant")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function DataManagementLoading() {
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

export default function DataManagementPage() {
  return (
    <Suspense fallback={<DataManagementLoading />}>
      <DataManagementContent />
    </Suspense>
  );
}
