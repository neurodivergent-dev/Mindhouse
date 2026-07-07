"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Brain,
  Database,
  GraduationCap,
  Users,
  Play,
  Menu,
  LogOut,
  User,
  Settings,
  Home,
  UserCircle,
  Lightbulb,
  MoreHorizontal,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, logout, isAuthenticated } = useAuth();
  const t = useTranslations("Navigation");
  const tCommon = useTranslations("Common");

  const navLinks = [
    { href: "/landing", label: t("landing"), icon: Home },
    { href: "/demo", label: t("demo"), icon: Play },
    { href: "/dashboard", label: t("dashboard"), icon: Brain },
    { href: "/quiz", label: t("quiz"), icon: BookOpen },
    { href: "/flashcard", label: t("flashcard"), icon: Brain },
    { href: "/topic-explainer", label: t("topicExplainer"), icon: Lightbulb },
    { href: "/ai-chat", label: t("aiChat"), icon: Users },
    { href: "/ai-3d-education", label: t("ai3dEducation"), icon: Brain },
    { href: "/question-manager", label: t("questionManager"), icon: Database },
    { href: "/subject-manager", label: t("subjectManager"), icon: GraduationCap },
    { href: "/settings", label: t("settings"), icon: Settings },
  ] as const;

  const desktopNavLinks = [
    { href: "/landing", label: t("landing"), icon: Home },
    { href: "/demo", label: t("demo"), icon: Play },
    { href: "/dashboard", label: t("dashboardShort"), icon: Brain },
    { href: "/quiz", label: t("quizShort"), icon: BookOpen },
    { href: "/flashcard", label: t("flashcard"), icon: Brain },
    { href: "/topic-explainer", label: t("topicExplainerShort"), icon: Lightbulb },
    { href: "/ai-chat", label: t("aiChatShort"), icon: Users },
    { href: "/ai-3d-education", label: t("ai3dEducationShort"), icon: Brain },
    { href: "/question-manager", label: t("questionManagerShort"), icon: Database },
    { href: "/subject-manager", label: t("subjectManagerShort"), icon: GraduationCap },
  ] as const;

  return (
    <nav className="bg-background/75 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline font-bold text-xl text-blue-600">
              {tCommon("appName")}
            </span>
          </Link>

          {/* Sıkışık ekranlar (lg) için "Daha Fazla" menülü versiyon */}
          <div className="hidden lg:flex xl:hidden flex-1 justify-center items-center gap-1 mx-4">
            {desktopNavLinks.slice(0, 5).map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
            
            {desktopNavLinks.length > 5 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1.5 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    <span>{tCommon("more", { fallback: "More" })}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {desktopNavLinks.slice(5).map(({ href, label, icon: Icon }) => (
                    <DropdownMenuItem key={href} asChild>
                      <Link href={href} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Geniş ekranlar (xl+) için tüm menüyü gösteren versiyon */}
          <div className="hidden xl:flex flex-1 justify-center items-center gap-1 mx-4">
            {desktopNavLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="whitespace-nowrap">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white hover:border-0"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            <Link href="/settings">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white hover:border-0 transition-all"
              >
                <Settings className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">{t("settings")}</span>
              </Button>
            </Link>
            <LanguageSwitcher />
            <ThemeToggle />
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white hover:border-0 max-w-[200px]"
                  >
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage
                        src={user?.user_metadata?.avatar_url}
                        alt={user?.user_metadata?.full_name || user?.email}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium">
                        {user?.user_metadata?.full_name
                            ?.charAt(0)
                            .toUpperCase() ||
                          user?.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {user?.user_metadata?.full_name ||
                        user?.email?.split("@")[0] ||
                        tCommon("user")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-background/95 border border-border w-64"
                >
                  <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border">
                    <div className="break-words break-all">{user?.email}</div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4" />
                      {t("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      {t("settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      void logout();
                    }}
                    className="flex items-center gap-2 text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white hover:border-0"
                >
                  <User className="w-4 h-4" />
                  {t("login")}
                </Button>
              </Link>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-2 ml-auto">
            {!loading && !isAuthenticated && (
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {t("loginShort")}
                </Button>
              </Link>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="glass-card-inner hover:scale-105 transition-all duration-300"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass-sheet">
                <SheetTitle className="sr-only">{tCommon("menu")}</SheetTitle>
                <SheetDescription className="sr-only">
                  {tCommon("mainNavigationMenu")}
                </SheetDescription>
                <div className="flex flex-col h-full">
                  <div className="flex-shrink-0 p-4 pb-2">
                    <Link
                      href="/landing"
                      className="flex items-center gap-2 group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <Brain className="h-8 w-8 text-white" />
                      </div>
                      <span className="font-headline font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {tCommon("appName")}
                      </span>
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                    {isAuthenticated && user && (
                      <div className="space-y-3">
                        <div className="glass-card-inner p-3 rounded-lg shadow-lg">
                          <div className="flex items-center gap-3 text-sm text-foreground">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage
                                src={user?.user_metadata?.avatar_url}
                                alt={
                                  user?.user_metadata?.full_name || user?.email
                                }
                              />
                              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium">
                                {user?.user_metadata?.full_name
                                    ?.charAt(0)
                                    .toUpperCase() ||
                                  user?.email?.charAt(0).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <span className="font-medium break-words break-all block">
                                {user.user_metadata?.full_name ||
                                  user.email?.split("@")[0] ||
                                  tCommon("user")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white backdrop-blur-sm transition-all duration-300 group hover:scale-105"
                        >
                          <UserCircle className="w-5 h-5 group-hover:text-white transition-colors duration-300" />
                          <span className="font-medium group-hover:text-white transition-colors duration-300">
                            {t("profile")}
                          </span>
                        </Link>
                      </div>
                    )}

                    <div className="space-y-2">
                      {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white backdrop-blur-sm transition-all duration-300 group hover:scale-105"
                        >
                          <Icon className="w-5 h-5 group-hover:text-white transition-colors duration-300" />
                          <span className="font-medium group-hover:text-white transition-colors duration-300">
                            {label}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {isAuthenticated && user && (
                      <div className="pt-4">
                        <Button
                          onClick={() => {
                            logout();
                            setIsOpen(false);
                          }}
                          variant="outline"
                          className="w-full flex items-center justify-center gap-3 p-4 rounded-lg bg-red-50/20 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200/50 dark:border-red-800/50 hover:bg-red-100/30 dark:hover:bg-red-800/30 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 hover:scale-105 font-semibold text-base"
                        >
                          <LogOut className="w-6 h-6" />
                          <span>{t("logout")}</span>
                        </Button>
                      </div>
                    )}

                    <div className="h-4"></div>
                  </div>

                  <div className="flex-shrink-0 border-t border-white/20 dark:border-white/10 p-4 pt-3 flex items-center justify-between gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
