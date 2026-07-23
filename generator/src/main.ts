import { generateApiEndpoints } from './generators/api_endpoints';
import { generateApiSchemas } from './generators/api_schemas';
import { generateEntityIds } from './generators/entity_id';
import { generateErrors } from './generators/errors';
import { generateFrontendComponents } from './generators/frontend_components';
import { generateKbns } from './generators/kbns';
import { generatePages } from './generators/pages';
import { generateTables } from './generators/tables';

const main = () => {
  generateTables();
  generateKbns();
  generateErrors();
  generateEntityIds();
  generateApiSchemas();
  generateApiEndpoints();
  generatePages();
  generateFrontendComponents();
};

main();
