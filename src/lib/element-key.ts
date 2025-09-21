import { AppObjectKey } from "./app-objects-schemas";
import { getPluralForm, getSingularForm } from "./pluralize-utils";

/**
 * Construct the key of an element based on some standard naming convention
 *
 * All elements on membrane should follow this naming convention.
 */
export const getElementKey = (
  appObjectKey: AppObjectKey,
  elementType:
    | "list-action"
    | "create-action"
    | "update-action"
    | "delete-action"
    | "field-mapping"
    | "data-source"
    | "flow"
) => {
  const pluralizedAppObjectKey = getPluralForm(appObjectKey);
  const singularizedAppObjectKey = getSingularForm(appObjectKey);

  switch (elementType) {
    case "list-action":
      return `list-${pluralizedAppObjectKey}`;
    case "create-action":
      return `create-${singularizedAppObjectKey}`;
    case "update-action":
      return `update-${singularizedAppObjectKey}`;
    case "delete-action":
      return `delete-${singularizedAppObjectKey}`;
    case "field-mapping":
      return `${pluralizedAppObjectKey}`;
    case "data-source":
      return `${pluralizedAppObjectKey}`;
    case "flow":
      return `receive-${singularizedAppObjectKey}-events`;
  }
};
