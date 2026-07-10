"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Building,
  Users,
  MessageSquare,
} from "lucide-react";
import MobileNav from "@/components/mobile-nav";

export default function ContactPage() {
  const t = useTranslations("Contact");
  const tCommon = useTranslations("Common");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const faqItems = useMemo(
    () => [
      { question: t("faq1Question"), answer: t("faq1Answer") },
      { question: t("faq2Question"), answer: t("faq2Answer") },
      { question: t("faq3Question"), answer: t("faq3Answer") },
      { question: t("faq4Question"), answer: t("faq4Answer") },
    ],
    [t],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/xblkaqka", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-transparent dark:!bg-none">
      <MobileNav />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="apple-glass-card border-0 shadow-lg rounded-3xl h-full flex flex-col">
              <CardHeader className="pt-6">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{t("formTitle")}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  {t("formDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pb-6">
                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">{t("nameLabel")}</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder={t("namePlaceholder")}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{tCommon("email")}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={tCommon("emailPlaceholder")}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">{t("subjectLabel")}</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder={t("subjectPlaceholder")}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">{t("messageLabel")}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder={t("messagePlaceholder")}
                        rows={6}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-extrabold rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] border-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {t("submitting")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t("submit")}
                      </>
                    )}
                  </Button>
                </form>

                {submitStatus === "success" && (
                  <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t("successMessage")}
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t("errorMessage")}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6 h-full justify-between">
            <Card className="apple-glass-card border-0 shadow-lg rounded-3xl flex-1 flex flex-col">
              <CardHeader className="pt-6">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{tCommon("appName")}</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  {t("companyTagline")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-center pb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Mail className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">info@mindhouse.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <Phone className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">+90 (212) 555-0123</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <MapPin className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("location")}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Clock className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("workingHours")}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="apple-glass-card border-0 shadow-lg rounded-3xl flex-1 flex flex-col">
              <CardHeader className="pt-6">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{t("supportChannelsTitle")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col justify-center pb-6">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10">
                  <span className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("technicalSupport")}</span>
                  <Badge className="bg-blue-500/10 text-blue-500 border-0 font-extrabold px-3 py-1 text-xs rounded-full shadow-none">
                    {t("badgeFast")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10">
                  <span className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("sales")}</span>
                  <Badge className="bg-green-500/10 text-green-500 border-0 font-extrabold px-3 py-1 text-xs rounded-full shadow-none">
                    {t("badgeActive")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10">
                  <span className="text-sm font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">{t("partnership")}</span>
                  <Badge className="bg-purple-500/10 text-purple-500 border-0 font-extrabold px-3 py-1 text-xs rounded-full shadow-none">
                    {t("badgeOpen")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("faqTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqItems.map((faq) => (
              <Card key={faq.question} className="border-gradient-question">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
