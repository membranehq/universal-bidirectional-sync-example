import { getPluralForm } from "./pluralize-utils";

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

  switch (elementType) {
    case "list-action":
      return `get-${pluralizedRecordType}`;
    case "create-action":
      return `create-${recordType}`;
    case "update-action":
      return `update-${recordType}`;
    case "delete-action":
      return `delete-${recordType}`;
    case "field-mapping":
      return `${pluralizedRecordType}`;
    case "data-source":
      return `${pluralizedRecordType}`;
    case "flow":
      return `receive-${recordType}-events`;
  }
};
