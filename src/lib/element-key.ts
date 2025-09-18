import { getPluralForm, getSingularForm } from "./pluralize-utils";

/**
 * Construct the key of an element based on some standard naming convention
 *
 * All elements on membrane should follow this naming convention.
 */
export const getElementKey = (
  recordType: string,
  elementType:
    | "list-action"
    | "create-action"
    | "update-action"
    | "delete-action"
    | "field-mapping"
    | "data-source"
    | "flow"
) => {
  const pluralizedRecordType = getPluralForm(recordType);
  const singularizedRecordType = getSingularForm(recordType);

  switch (elementType) {
    case "list-action":
      return `list-${pluralizedRecordType}`;
    case "create-action":
      return `create-${singularizedRecordType}`;
    case "update-action":
      return `update-${singularizedRecordType}`;
    case "delete-action":
      return `delete-${singularizedRecordType}`;
    case "field-mapping":
      return `${pluralizedRecordType}`;
    case "data-source":
      return `${pluralizedRecordType}`;
    case "flow":
      return `receive-${singularizedRecordType}-events`;
  }
};
