"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import ImageUploadField from "@/components/dashboard/ImageUploadField";
import type { BlogPost } from "@/lib/data/blog";
import type { BlogPostFormState } from "@/app/(dashboard)/dashboard/blog/actions";

interface BlogPostFormProps {
  action: (state: BlogPostFormState, formData: FormData) => Promise<BlogPostFormState>;
  post?: BlogPost;
  submitLabel: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export default function BlogPostForm({ action, post, submitLabel }: BlogPostFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-5">
      <Input id="title" name="title" label="Title" defaultValue={post?.title} required />
      <Input id="slug" name="slug" label="Slug" placeholder="my-post" defaultValue={post?.slug} required />
      <Input id="date" name="date" type="date" label="Date" defaultValue={post?.date} required />
      <Textarea id="excerpt" name="excerpt" label="Excerpt" rows={2} defaultValue={post?.excerpt} required />
      <Textarea
        id="content"
        name="content"
        label="Full write-up"
        rows={12}
        defaultValue={post?.content}
        placeholder="Leave blank to keep this post as a preview-only excerpt for now."
      />
      <Input
        id="tags"
        name="tags"
        label="Tags"
        placeholder="SIEM, Tutorial, Wazuh"
        defaultValue={post?.tags.join(", ")}
      />
      <p className="-mt-3 text-xs text-muted-foreground">Comma-separated.</p>
      <ImageUploadField name="coverImage" label="Cover image" currentImageUrl={post?.coverImageUrl} />

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton label={submitLabel} />
        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
