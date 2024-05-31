import React from "react";
export interface Props {
    method: string;
    path: string;
}
declare function MethodEndpoint({ method, path }: Props): React.JSX.Element;
export default MethodEndpoint;
