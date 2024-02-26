import {
  AutocompleteInput,
  ReferenceInput,
  ReferenceInputProps,
} from "react-admin";

export const AutocompleteFilter = ({
  source,
  reference,
  field,
  label,
  alwaysOn,
  filter,
}: {
  source: string; //the local field that points to the foreign field (e.g. creator_id)
  reference: string; //the name of the foreign resource (e.g. users)
  field: string; //the field of the foreign resource (e.g. handle)
  label?: string;
  alwaysOn?: boolean;
  filter?: ReferenceInputProps["filter"];
}) => (
  <ReferenceInput
    source={source}
    reference={reference}
    alwaysOn={alwaysOn}
    filter={filter}
  >
    <AutocompleteInput
      optionText={field}
      label={label || `${reference} ${field}`}
      filterToQuery={(searchText) => ({ [field]: searchText })}
    />
  </ReferenceInput>
);
