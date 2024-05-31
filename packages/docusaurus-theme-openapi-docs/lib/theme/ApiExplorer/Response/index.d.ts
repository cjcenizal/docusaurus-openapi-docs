import React from "react";
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
declare function Response({ item }: {
    item: NonNullable<ApiItem>;
}): React.JSX.Element | null;
export default Response;
