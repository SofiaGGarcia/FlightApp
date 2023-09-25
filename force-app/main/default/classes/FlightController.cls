public class FlightController {
    @AuraEnabled
    public static List<Airport__c> getAirportsByIATA(String iataCode) {
        // Consulta la base de datos para obtener aeropuertos con el código IATA proporcionado
        List<Airport__c> airports = [SELECT Id, Name, IATA_Code__c, Latitude__c, Longitude__c FROM Airport__c WHERE IATA_Code__c = :iataCode LIMIT 1];
        
        return airports;
    }

    @AuraEnabled
    public static void createFlight(String departureAirportId, String arrivalAirportId, Decimal flightDistance) {
        Flight__c newFlight = new Flight__c();
        newFlight.Departure_Airport__c = departureAirportId;
        newFlight.Arrival_Airport__c = arrivalAirportId;
        newFlight.Flight_Distance__c = flightDistance;

        try {
            insert newFlight;
        } catch (Exception e) {
            System.debug('Error al insertar el vuelo: ' + e.getMessage());
            throw new AuraHandledException('Error al guardar el vuelo');
        }
    }
}