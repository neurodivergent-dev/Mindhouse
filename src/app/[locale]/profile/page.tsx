"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Edit3,
  Camera,
  Settings,
  Trophy,
  Clock,
  Target,
  ArrowLeft,
  Loader2,
  X,
  Lock,
  Database,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import MobileNav from "@/components/mobile-nav";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useTranslations, useLocale } from "next-intl";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string | undefined;
  avatarPublicId?: string | undefined;
  joinDate: string;
  totalTests: number;
  averageScore: number;
  totalTime: string;
  subjects: string[];
}

function ProfileContent() {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const dateLocale = locale === "tr" ? "tr-TR" : "en-US";
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (authLoading) {
        return;
      }

      if (!authUser) {
        // Redirect to login if not authenticated
        window.location.href = "/login";
        return;
      }

      try {
        setIsLoading(true);

        // Use Supabase Auth data directly
        setUser({
          id: authUser.id,
          name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            t("user"),
          email: authUser.email || "",
          avatar: authUser.user_metadata?.avatar_url,
          avatarPublicId: authUser.user_metadata?.avatar_public_id,
          joinDate: new Date(authUser.created_at).toLocaleDateString(dateLocale),
          totalTests: 0, // Will be calculated from quiz_results table
          averageScore: 0, // Will be calculated from performance_analytics
          totalTime: t("hoursUnit", { count: 0 }),
          subjects: [], // Will be fetched from subjects table
        });
      } catch {
        // Fallback to auth user data
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.full_name || t("user"),
          email: authUser.email || "",
          avatar: authUser.user_metadata?.avatar_url,
          avatarPublicId: authUser.user_metadata?.avatar_public_id,
          joinDate: new Date(authUser.created_at).toLocaleDateString(dateLocale),
          totalTests: 0,
          averageScore: 0,
          totalTime: t("hoursUnit", { count: 0 }),
          subjects: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [authUser, authLoading, t, dateLocale]);

  const handleSave = async () => {
    if (!user || !authUser) {
      return;
    }

    try {
      setIsSaving(true);

      // Update user profile in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: user.name,
        },
      });

      if (error) {
        throw error;
      }
      setIsEditing(false);
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!authUser) {
      return;
    }

    try {
      setIsUploading(true);

      // Upload to our API route
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const avatarUrl = data.url;
      const avatarPublicId = data.public_id;

      // Update user metadata with new avatar URL and public ID
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
          avatar_public_id: avatarPublicId,
        },
      });

      if (error) {
        throw error;
      }

      // Update local state
      setUser((prev) =>
        prev ? { ...prev, avatar: avatarUrl, avatarPublicId } : null,
      );
    } catch {
      // Show error toast
      toast({
        title: t("error"),
        description: t("photoUploadError"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleAvatarUpload(file);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!authUser || !user?.avatar) {
      return;
    }

    try {
      setIsUploading(true);

      // Extract public ID from Cloudinary URL if not stored
      let publicId = user.avatarPublicId;
      if (!publicId && user.avatar.includes("cloudinary.com")) {
        // Extract from URL: https://res.cloudinary.com/mindhouse/image/upload/v1753750979/mindhouse-avatars/ww6azgioynelqecyt8qk.webp
        const urlParts = user.avatar.split("/");
        const uploadIndex = urlParts.findIndex((part) => part === "upload");
        if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
          publicId = urlParts
            .slice(uploadIndex + 2)
            .join("/")
            .replace(/\.[^/.]+$/, ""); // Remove extension
        }
      }

      // If we have public ID, delete from Cloudinary
      if (publicId) {
        const response = await fetch("/api/delete-avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicId }),
        });

        if (!response.ok) {
          await response.text();
        } else {
          await response.json();
        }
      } else {
      }

      // Update user metadata to remove avatar URL and public ID
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: null,
          avatar_public_id: null,
        },
      });

      if (error) {
        throw error;
      }

      // Update local state
      setUser((prev) =>
        prev ? { ...prev, avatar: undefined, avatarPublicId: undefined } : null,
      );
    } catch {
      toast({
        title: t("error"),
        description: t("photoRemoveError"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{tCommon("loading")}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("userInfoError")}
          </p>
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
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  {t("home")}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">{t("title")}</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="mb-4 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("backToDashboard")}
              </Button>
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("profileSettings")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t("profileSettingsDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-gradient-question">
                  <CardContent className="p-8 text-center">
                    {/* Avatar Section */}
                    <div className="mb-6">
                      <div className="relative inline-block group">
                        <Avatar className="w-24 h-24 mx-auto mb-4">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Camera Button */}
                        <Button
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </Button>

                        {/* Delete Button - Only show if avatar exists */}
                        {user?.avatar && (
                          <Button
                            size="sm"
                            onClick={() => {
                              void handleDeleteAvatar();
                            }}
                            disabled={isUploading}
                            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        {user.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {user.email}
                      </p>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                        {t("activeUser")}
                      </Badge>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t("totalTests")}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {user.totalTests}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <Target className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t("averageSuccess")}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          %{user.averageScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-purple-500 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t("totalTime")}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {user.totalTime}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Settings Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="h-full"
              >
                <Card className="border-gradient-question h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-blue-600" />
                      {t("accountInfo")}
                    </CardTitle>
                    <CardDescription>
                      {t("accountInfoDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 flex flex-col">
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t("fullName")}</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="name"
                              value={user.name}
                              onChange={(e) =>
                                setUser({ ...user, name: e.target.value })
                              }
                              className="pl-10"
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("email")}</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              value={user.email}
                              className="pl-10 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                              disabled={true}
                              readOnly
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t("emailCannotChange")}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("studiedSubjects")}</Label>
                        <div className="flex flex-wrap gap-2">
                          {user.subjects.length > 0 ? (
                            user.subjects.map((subject, index) => (
                              <Badge
                                key={index}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0"
                              >
                                {subject}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t("noSubjectsYet")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - At the bottom of the card */}
                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-3 flex-wrap">
                        {!isEditing ? (
                          <>
                            <Button
                              onClick={() => setIsEditing(true)}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              {t("edit")}
                            </Button>
                            <Link href="/change-password">
                              <Button
                                variant="outline"
                                className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                {t("changePassword")}
                              </Button>
                            </Link>
                            <Link href="/data-management">
                              <Button
                                variant="outline"
                                className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
                              >
                                <Database className="w-4 h-4 mr-2" />
                                {t("dataManagement")}
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => {
                                void handleSave();
                              }}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Edit3 className="w-4 h-4 mr-2" />
                              )}
                              {t("save")}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              className="hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
                              disabled={isSaving}
                            >
                              {t("cancel")}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileLoading() {
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

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}
