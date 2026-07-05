"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { Subject, QuestionFormData } from "@/types/question-manager";
import { QUESTION_TYPES, DIFFICULTIES } from "@/types/question-manager";
import { SelectField, SubjectSelectField, InputField, TextareaField } from "./form-field";
import QuestionOptions from "./question-options";
import FormActions from "./form-actions";
import { getFormDifficultyLabel, getFormTypeLabel } from "@/lib/question-manager-labels";

interface QuestionFormProps {
  subjects: Subject[];
  formData: QuestionFormData;
  onFormDataChange: (field: keyof QuestionFormData, value: string | number) => void;
  onOptionChange: (index: number, field: "text" | "isCorrect", value: string | boolean) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  isCreating: boolean;
}

const questionTypes = QUESTION_TYPES;
const difficulties = DIFFICULTIES;

export default function QuestionForm({
  subjects,
  formData,
  onFormDataChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onSubmit,
  onReset,
  isCreating,
}: QuestionFormProps) {
  const t = useTranslations("QuestionManager");

  return (
    <Card id="question-form" className="border-gradient-question shadow-lg h-full">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          {t("addNewQuestion")}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t("addNewQuestionDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <SubjectSelectField
            id="subject"
            label={t("subject")}
            value={formData.subject}
            onChange={(value) => onFormDataChange("subject", value)}
            subjects={subjects}
            placeholder={t("selectSubject")}
          />
          <InputField
            id="topic"
            label={t("topic")}
            value={formData.topic}
            onChange={(value) => onFormDataChange("topic", value)}
            placeholder={t("topicPlaceholder")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <SelectField
            id="type"
            label={t("questionType")}
            value={formData.type}
            onChange={(value) => onFormDataChange("type", value)}
            options={questionTypes}
            getOptionLabel={(option) => getFormTypeLabel(option, t)}
          />
          <SelectField
            id="difficulty"
            label={t("difficulty")}
            value={formData.difficulty}
            onChange={(value) => onFormDataChange("difficulty", value)}
            options={difficulties}
            getOptionLabel={(option) => getFormDifficultyLabel(option, t)}
          />
        </div>

        <TextareaField
          id="text"
          label={t("questionText")}
          value={formData.text}
          onChange={(value) => onFormDataChange("text", value)}
          placeholder={t("questionTextPlaceholder")}
          rows={3}
        />

        {formData.type === "Çoktan Seçmeli" && (
          <QuestionOptions
            options={formData.options}
            onOptionChange={onOptionChange}
            onAddOption={onAddOption}
            onRemoveOption={onRemoveOption}
          />
        )}

        <TextareaField
          id="explanation"
          label={t("explanation")}
          value={formData.explanation}
          onChange={(value) => onFormDataChange("explanation", value)}
          placeholder={t("explanationPlaceholder")}
          rows={3}
        />

        {formData.type === "Hesaplama" && (
          <InputField
            id="formula"
            label={t("formulaOptional")}
            value={formData.formula}
            onChange={(value) => onFormDataChange("formula", value)}
            placeholder={t("formulaPlaceholder")}
          />
        )}

        <FormActions
          onSubmit={onSubmit}
          onReset={onReset}
          isCreating={isCreating}
        />
      </CardContent>
    </Card>
  );
}