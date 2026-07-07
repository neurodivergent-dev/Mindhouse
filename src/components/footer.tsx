"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Brain, Github, Linkedin, Youtube, Heart } from "lucide-react";

export default function Footer() {
  const t = useTranslations("Footer");
  const tCommon = useTranslations("Common");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t mt-auto">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link href="/landing" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800 dark:text-white">
                {tCommon("appName")}
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400">{t("tagline")}</p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                {t("pages")}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/landing"
                    className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("home")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/quiz"
                    className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("quiz")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/flashcard"
                    className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("flashcard")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/topic-explainer"
                    className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("topicExplainer")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                {t("support")}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("contact")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("help")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("pricing")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                {t("legal")}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {t("termsOfService")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center md:justify-end items-start">
            <div className="text-left md:text-right">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                {t("followUs")}
              </h3>
              <div className="flex mt-4 space-x-6 justify-start md:justify-end">
                <a
                  href="https://www.youtube.com/@Mindhouse-Tech"
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">YouTube</span>
                  <Youtube className="h-6 w-6" />
                </a>
                <a
                  href="https://github.com/melihcanndemir/mindhouse"
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">GitHub</span>
                  <Github className="h-6 w-6" />
                </a>
                <a
                  href="https://www.linkedin.com/in/melihcandemir/"
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
          <p className="text-base text-gray-400">
            {t("copyright", { year })}
          </p>
          <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1 flex-wrap">
            {t.rich("madeBy", {
              author: (chunks) => (
                <span className="text-blue-500 font-medium">
                  {chunks}
                </span>
              ),
              heart: () => (
                <Heart className="h-4 w-4 text-red-500 animate-pulse inline" />
              ),
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
