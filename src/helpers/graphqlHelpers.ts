import { FieldNode, OperationDefinitionNode } from "graphql";
import gql from "graphql-tag";

export type OperationDetails = {
  operationName: string;
  operation: string;
};

export const parseGraphqlQuery = (queryString: any) => {
  return gql`
    ${queryString}
  `;
};

export const parseGraphqlRequest = (
  requestBody?: string
): { query: string; variables: object }[] => {
  const requestPayload = JSON.parse(requestBody || "");
  const requestPayloads = Array.isArray(requestPayload)
    ? requestPayload
    : [requestPayload];
  return requestPayloads;
};

export const getPrimaryOperation = (
  requestBody?: string
): OperationDetails | null => {
  try {
    const request = JSON.parse(requestBody || "");
    const postData = Array.isArray(request) ? request : [request];
    const documentNode = parseGraphqlQuery(postData[0].query);
    const firstOperationDefinition = documentNode.definitions.find(
      (def) => def.kind === "OperationDefinition"
    ) as OperationDefinitionNode;
    const field = firstOperationDefinition.selectionSet.selections.find(
      (selection) => selection.kind === "Field"
    ) as FieldNode;
    const operationName =
      field?.name.value || firstOperationDefinition.name?.value;

    if (!operationName) {
      throw new Error("Operation name could not be determined");
    }

    return {
      operationName,
      operation: firstOperationDefinition?.operation,
    };
  } catch (e) {
    return null;
  }
};
