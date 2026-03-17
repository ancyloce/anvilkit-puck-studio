import { TextField } from "./types/TextField";
import { TextareaField } from "./types/TextareaField";
import { NumberField } from "./types/NumberField";
import { SelectField } from "./types/SelectField";
import { RadioField } from "./types/RadioField";
import { ArrayField } from "./types/ArrayField";
import { ObjectField } from "./types/ObjectField";
import { SlotField } from "./types/SlotField";
import { CustomField } from "./types/CustomField";
import { RichtextField } from "./types/RichtextField";
import { ExternalField } from "./types/ExternalField";

// fieldTypes aggregator — no rendering logic here, just re-exports
export const fieldTypesRegistry = {
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  radio: RadioField,
  array: ArrayField,
  object: ObjectField,
  slot: SlotField,
  custom: CustomField,
  richtext: RichtextField,
  external: ExternalField,
};

export type FieldTypesRegistry = typeof fieldTypesRegistry;
