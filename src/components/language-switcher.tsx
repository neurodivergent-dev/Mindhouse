"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) {
      return;
    }
    router.replace(pathname, { locale: newLocale });
  };

  // Light mode için daha açık, dark mode için canlı gradient
  const gradientClass = "hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-900 dark:hover:from-blue-600 dark:hover:to-purple-600 dark:hover:text-white transition-all";
  const activeClass = "bg-gradient-to-r from-blue-200 to-purple-200 text-blue-900 dark:from-blue-600 dark:to-purple-600 dark:text-white";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("switchLanguage")}
          className={`${gradientClass} hover:border-0`}
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("tr")}
          className={`${gradientClass} ${locale === "tr" ? activeClass : ""}`}
        >
          {t("turkish")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          className={`${gradientClass} ${locale === "en" ? activeClass : ""}`}
        >
          {t("english")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}