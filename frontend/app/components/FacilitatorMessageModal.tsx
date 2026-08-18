import { LineIcon } from "./DesignPrimitives";

type FacilitatorMessageModalProps = {
  facilitatorName: string;
};

export function FacilitatorMessageModal({
  facilitatorName,
}: FacilitatorMessageModalProps) {
  return (
    <div className="sk thin v2 bg-calm-soft p-4 text-[15px] leading-6 text-calm-ink [border-color:var(--calm)]">
      <p className="mb-1 flex items-center gap-2 font-semibold">
        <LineIcon name="mail" size={16} />
        Private conversation with {facilitatorName}
      </p>
      This is a private space to message the facilitator directly. What you share
      here is only visible to you and {facilitatorName}.
    </div>
  );
}
