import type { ApiEndpointGroup } from '@seed/api_endpoints/types';
import { Endpoint } from './endpoint';

export class EndpointGroup {
  readonly name: string;
  readonly basePath: string;
  readonly description?: string;
  readonly endpoints: Endpoint[];
  readonly subEndpoints: EndpointGroup[];
  readonly filePath?: string;

  constructor(group: ApiEndpointGroup, filePath?: string) {
    this.name = group.name;
    this.basePath = group.basePath;
    this.description = group.description;
    this.filePath = filePath !== undefined ? `${filePath}/${group.name}` : '';

    this.endpoints = (group.endpoints || []).map(
      (e) => new Endpoint(e, group.name, group.basePath, this.filePath),
    );

    this.subEndpoints = Object.values(group.subEndpointGroups ?? {})
      .map((endpointGroup) => new EndpointGroup(endpointGroup, this.filePath))
      .sort();
  }
}
