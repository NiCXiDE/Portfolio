export type AdminMutationResult = {
  ok: true;
  auditId: string;
  message: string;
  undoable: boolean;
  variant: "success" | "danger";
};
