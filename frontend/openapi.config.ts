import { defineConfig } from 'ng-openapi';

export default defineConfig({
  input: 'http://localhost:8000/api/v1/openapi.json',
  output: './src/client',
  options: {
    dateType: 'string',
    enumStyle: 'enum',
  },
});
