interface Props {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizes = { sm: "h-4 w-4", md: "h-7 w-7", lg: "h-10 w-10" };

export default function Loader({ size = "md", text }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-[3px] border-indigo-100 dark:border-slate-700 border-t-indigo-600 animate-spin`}
      />
      {text && (
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
