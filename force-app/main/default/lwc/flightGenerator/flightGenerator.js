import { LightningElement, track } from 'lwc';
import createFlight from '@salesforce/apex/FlightController.createFlight';
import getAirportsByIATA from '@salesforce/apex/FlightController.getAirportsByIATA';

export default class FlightGenerator extends LightningElement {
    @track flightDistance = 0;
    @track departureAirport;
    @track arrivalAirport;
    @track departureIATA = '';
    @track arrivalIATA = '';

    // Método para calcular la distancia usando la fórmula de Haversine
    calculateDistance() {
        if (this.departureAirport && this.arrivalAirport) {
            const departureLat = this.departureAirport.Latitude__c;
            const departureLon = this.departureAirport.Longitude__c;
            const arrivalLat = this.arrivalAirport.Latitude__c;
            const arrivalLon = this.arrivalAirport.Longitude__c;

            const radianConversion = (degrees) => (degrees * Math.PI) / 180;
            const earthRadius = 6371; // Radio de la Tierra en kilómetros

            const dLat = radianConversion(arrivalLat - departureLat);
            const dLon = radianConversion(arrivalLon - departureLon);

            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(radianConversion(departureLat)) *
                    Math.cos(radianConversion(arrivalLat)) *
                    Math.sin(dLon / 2) *
                    Math.sin(dLon / 2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            this.flightDistance = earthRadius * c;
        } else {
            this.flightDistance = 0;
        }
    }

    // Método para buscar el aeropuerto por código IATA
    getAirportByIATA(type) {
        const iataCode = type === 'departure' ? this.departureIATA : this.arrivalIATA;

        if (iataCode) {
            getAirportsByIATA({ iataCode })
                .then((result) => {
                    if (result.length > 0) {
                        if (type === 'departure') {
                            this.departureAirport = result[0];
                        } else {
                            this.arrivalAirport = result[0];
                        }
                        // Calcular la distancia cuando se seleccionan ambos aeropuertos
                        this.calculateDistance();
                    } else {
                        // Limpiar el aeropuerto si no se encuentra
                        if (type === 'departure') {
                            this.departureAirport = null;
                        } else {
                            this.arrivalAirport = null;
                        }
                        // Reiniciar la distancia si falta un aeropuerto
                        this.flightDistance = 0;
                    }
                })
                .catch((error) => {
                    console.error('Error al buscar el aeropuerto:', error);
                });
        }
    }

    // Método para manejar el cambio de código IATA de Aeropuerto de Salida
    handleDepartureIATAChange(event) {
        this.departureIATA = event.target.value;
        this.getAirportByIATA('departure');
    }

    // Método para manejar el cambio de código IATA de Aeropuerto de Llegada
    handleArrivalIATAChange(event) {
        this.arrivalIATA = event.target.value;
        this.getAirportByIATA('arrival');
    }

    // Método para manejar el envío del formulario
    handleSubmit(event) {
        event.preventDefault();
        // Obtén los IDs de los aeropuertos de salida y llegada
        const departureAirportId = this.departureAirport && this.departureAirport.Id;
        const arrivalAirportId = this.arrivalAirport && this.arrivalAirport.Id;

        if (departureAirportId && arrivalAirportId) {
            // Llama al método Apex para guardar el vuelo
            createFlight({ departureAirportId, arrivalAirportId, flightDistance: this.flightDistance })
                .then((result) => {
                    // Maneja el resultado después de guardar el vuelo
                    console.log('Vuelo guardado:', result);
                    // Aquí puedes realizar acciones adicionales, como mostrar un mensaje de éxito.
                    this.resetForm();
                })
                .catch((error) => {
                    // Maneja los errores si la inserción del vuelo falla
                    console.error('Error al guardar el vuelo:', error);
                    // Aquí puedes mostrar un mensaje de error o realizar otras acciones de manejo de errores.
                });
        }
    }

    // Método para reiniciar el formulario después de guardar el vuelo
    resetForm() {
        this.departureAirport = null;
        this.arrivalAirport = null;
        this.departureIATA = '';
        this.arrivalIATA = '';
        this.flightDistance = 0;
    }
}