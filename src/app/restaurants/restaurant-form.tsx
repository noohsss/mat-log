"use client";

import { SubmitButton } from "@/components/submit-button";

const FOOD_TYPES = ["한식", "중식", "일식", "양식", "카페·디저트", "술집·바", "기타"];
const PRICE_RANGES = ["저렴", "보통", "비쌈"];

type RestaurantFormValues = {
  name?: string;
  region?: string;
  food_type?: string;
  price_range?: string;
  rating?: number | null;
  memo?: string | null;
  topicTags?: string;
  targetTags?: string;
};

export function RestaurantForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  initialValues?: RestaurantFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-700">
        기록한 정보는 추천 게시판에 자동으로 공개됩니다.
      </p>

      <Field label="가게명" name="name" defaultValue={initialValues?.name} required />
      <Field
        label="지역·위치"
        name="region"
        defaultValue={initialValues?.region}
        placeholder="예: 서울 마포구"
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="음식 종류"
          name="food_type"
          options={FOOD_TYPES}
          defaultValue={initialValues?.food_type}
          required
        />
        <SelectField
          label="가격대"
          name="price_range"
          options={PRICE_RANGES}
          defaultValue={initialValues?.price_range}
          required
        />
      </div>

      <Field
        label="평점 (0~5)"
        name="rating"
        type="number"
        step="0.5"
        min="0"
        max="5"
        defaultValue={initialValues?.rating ?? undefined}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="주제 태그"
          name="topicTags"
          defaultValue={initialValues?.topicTags}
          placeholder="데이트, 회식 (쉼표로 구분)"
        />
        <Field
          label="대상 태그"
          name="targetTags"
          defaultValue={initialValues?.targetTags}
          placeholder="친구, 가족 (쉼표로 구분)"
        />
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700">메모</span>
        <textarea
          name="memo"
          defaultValue={initialValues?.memo ?? ""}
          rows={5}
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-black outline-none focus:border-black/30"
        />
      </label>

      <div className="mt-2 flex justify-end gap-3">
        <a
          href="/"
          className="flex h-11 cursor-pointer items-center rounded-full bg-zinc-100 px-5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-black"
        >
          취소
        </a>
        <SubmitButton
          pendingLabel={`${submitLabel} 중...`}
          className="h-11 rounded-full bg-[#ff6a3d] px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#e85a2f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  step,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  step?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        className="h-11 rounded-lg border border-black/10 bg-transparent px-3 text-black outline-none focus:border-black/30"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="h-11 rounded-lg border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
      >
        <option value="" disabled>
          선택
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
