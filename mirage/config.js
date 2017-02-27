export default function() {
  this.namespace = '/api';

  //this.get('/rentals', (schema, request) => {
  this.get('/rentals', (schema) => {
    return schema.rentals.all();
  });

}