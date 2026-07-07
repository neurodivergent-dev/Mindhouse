import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import MobileNav from "@/components/mobile-nav";

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TermsOfService" });
  const tFooter = await getTranslations({ locale, namespace: "Footer" });

  const emailLink = (chunks: ReactNode) => (
    <a
      href="mailto:support@mindhouse.com"
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {chunks}
    </a>
  );

  const sections = [
    { title: t("section1Title"), content: t("section1Content") },
    { title: t("section2Title"), content: t("section2Content") },
    { title: t("section3Title"), content: t("section3Content") },
    { title: t("section4Title"), content: t("section4Content") },
    {
      title: t("section5Title"),
      content: t.rich("section5Content", { email: emailLink }),
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-transparent">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/landing"
                  className="hover:text-foreground transition-colors"
                >
                  {tFooter("home")}
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">{t("title")}</li>
            </ol>
          </nav>

          <div className="glass-card p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("title")}
            </h1>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-lg mb-6 text-muted-foreground">{t("intro")}</p>

              {sections.map((section) => (
                <section key={section.title} className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </section>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border">
              <Link
                href="/landing"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {t("backHome")}
              </Link>
              <Link
                href="/privacy-policy"
                className="inline-flex items-center justify-center px-6 py-3 border border-border hover:bg-muted text-foreground font-medium rounded-lg transition-all duration-300 hover:scale-105"
              >
                {t("privacyPolicy")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
