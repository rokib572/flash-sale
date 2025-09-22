export type CreateProductValues = {
  name: string;
  quantity: number;
  disabled: boolean;
};

export type CreateProductViewProps = {
  values: CreateProductValues;
  loading?: boolean;
  error?: string | null;
  onChange: (patch: Partial<CreateProductValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

