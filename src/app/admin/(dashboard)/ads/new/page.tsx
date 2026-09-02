import UploadForm from "./UploadForm";

export default function NewAdPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-stone-900">Upload Advertisement</h1>
      <UploadForm />
    </div>
  );
}
