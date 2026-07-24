// Forma de los campos que arma el formulario de alta/edición. No viene del cliente
// generado porque el endpoint de creación recibe cada campo como multipart Form()
// individual, no como un body JSON — ng-openapi no expone un schema para eso.
export interface PropiedadForm {
  nombre: string;
  descripcion: string;
  ubicacion: string;
  precio: number;
  tipo: 'venta' | 'arriendo';
}
