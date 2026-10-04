import ChainAsset from "@shared/assets/images/mascot-icons/Link.png";
import { ensureHttps } from "@shared/utils/urlUtils";
import Button from "@shared/ui/Button";
import FormField from "@shared/ui/FormField";
import FormInput from "@shared/ui/FormInput";
import FormSectionHeader from "@shared/ui/FormSectionHeader";

interface ActionButtonsSectionProps {
  linkCta?: string;
  linkJoinProgram?: string;
  onCtaChange: (value: string) => void;
  onJoinProgramChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ActionButtonsSection({
  linkCta,
  linkJoinProgram,
  onCtaChange,
  onJoinProgramChange,
  onSave,
  onCancel,
}: ActionButtonsSectionProps) {
  return (
    <div className="actions mt-10 space-y-6">
      <FormSectionHeader icon={ChainAsset} title="Link & Action Buttons" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
        <FormField label="Link CTA (Hubungi Kami)" required>
          <FormInput
            placeholder="https://"
            type="text"
            value={linkCta || ""}
            onChange={(e) => onCtaChange(e.target.value)}
            onBlur={(e) => onCtaChange(ensureHttps(e.target.value))}
          />
        </FormField>
        <FormField label="Link Join Program" required>
          <FormInput
            placeholder="https://"
            type="text"
            value={linkJoinProgram || ""}
            onChange={(e) => onJoinProgramChange(e.target.value)}
            onBlur={(e) => onJoinProgramChange(ensureHttps(e.target.value))}
          />
        </FormField>
      </div>

      <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button variant="primary" size="lg" onClick={onSave}>
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
}
