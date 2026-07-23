import type {
  PageApi,
  PageNavigation,
  Page as PageTemplate,
  PathParam,
  QueryParam,
} from '@seed/pages';
import { toCamelCase, toPascalCase, toSnakeCase } from '../util';

export class Page {
  readonly pname: string;
  readonly lname: string;
  readonly path: string;
  readonly description: string;
  readonly requiresAuth: boolean;
  readonly apis: PageApi[];
  readonly navigations: PageNavigation[];
  readonly pathParams: PathParam[];
  readonly queryParams: QueryParam[];
  readonly passesCustomContext: boolean;
  readonly children: Page[];
  readonly parent: Page | null;

  constructor(template: PageTemplate, parent: Page | null = null) {
    this.pname = template.pname;
    this.lname = template.lname ?? template.pname;
    this.path = template.path;
    this.description = template.description ?? '';
    this.requiresAuth = template.requiresAuth ?? false;
    this.apis = template.apis ?? [];
    this.navigations = template.navigations ?? [];
    this.pathParams = template.pathParams ?? [];
    this.queryParams = template.queryParams ?? [];
    this.passesCustomContext = template.passesCustomContext ?? false;
    this.parent = parent;
    this.children = (template.children ?? []).map(
      (child) => new Page(child, this),
    );
  }

  get snakeName(): string {
    return toSnakeCase(this.pname);
  }

  get pascalName(): string {
    return toPascalCase(this.pname);
  }

  get camelName(): string {
    return toCamelCase(this.pname);
  }

  get entryPointName(): string {
    return `${this.pascalName}PageEntryPoint`;
  }

  get propsTypeName(): string {
    return `${this.pascalName}PageProps`;
  }

  get apisTypeName(): string {
    return `${this.pascalName}PageApis`;
  }

  get navigationsTypeName(): string {
    return `${this.pascalName}PageNavigations`;
  }

  getNavigationFunctionName(nav: PageNavigation): string {
    return `to${toPascalCase(nav.to)}`;
  }

  getApiFunctionName(api: PageApi): string {
    return toCamelCase(api.operationId);
  }

  get customContextTypeName(): string {
    return `${this.pascalName}PageCustomContext`;
  }

  get hasParentWithCustomComponent(): boolean {
    return this.parent?.passesCustomContext ?? false;
  }

  get parentCustomContextTypeName(): string | null {
    if (!this.hasParentWithCustomComponent || !this.parent) {
      return null;
    }
    return this.parent.customContextTypeName;
  }

  get isLayoutRoute(): boolean {
    return this.children.length > 0;
  }

  relativePathFrom(parentPath: string): string {
    if (this.path === parentPath) return '';
    const prefix = parentPath.endsWith('/') ? parentPath : `${parentPath}/`;
    if (this.path.startsWith(prefix)) {
      return this.path.slice(prefix.length);
    }
    return this.path;
  }

  getAllDescendants(): Page[] {
    const descendants: Page[] = [];
    for (const child of this.children) {
      descendants.push(child);
      descendants.push(...child.getAllDescendants());
    }
    return descendants;
  }
}
