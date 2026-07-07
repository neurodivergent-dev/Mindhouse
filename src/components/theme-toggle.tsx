"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const t = useTranslations("Theme");
  const { theme, setTheme } = useTheme();

  // Gradient ve text ayarlarını merkezi hale getirdik
  const itemClasses = "hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white transition-all cursor-pointer";
  const activeClasses = "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-900 dark:from-blue-600 dark:to-purple-600 dark:text-white";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white hover:border-0 transition-all"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t("toggleTheme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`${itemClasses} ${theme === "light" ? activeClasses : ""}`}
        >
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`${itemClasses} ${theme === "dark" ? activeClasses : ""}`}
        >
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`${itemClasses} ${theme === "system" ? activeClasses : ""}`}
        >
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
