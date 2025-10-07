# Tareas Pendientes: `TODO.md` 🛠️

Este documento describe las tareas principales y los puntos de análisis críticos necesarios para evolucionar el **Sensor Management System** de su estado de simulación (PoC) a un sistema listo para integrarse con hardware real (Raspberry Pi con sensores Modbus RS485).

-----

## 1\. Integración con Hardware Real (Raspberry Pi + Modbus RS485) 🚀

El paso más crítico es reemplazar el simulador actual con una implementación que lea datos de sensores físicos. Esto implica cerrar el ciclo completo de IoT.

### Tareas

  * **Desarrollar el Módulo de Lectura Modbus:**
      * Crear un nuevo cliente (que reemplazará al `pi-simulator`) en Node.js o Python (más común para GPIO/Modbus) para ejecutar en la Raspberry Pi.
      * Implementar la lógica para la comunicación **Modbus RS485** para leer registros de los sensores (temperatura, humedad, etc.).
      * Manejar la conversión de datos y la gestión de errores/timeouts de la comunicación Modbus.
  * **Adaptar la Publicación MQTT:**
      * Asegurar que los datos leídos del Modbus se estructuren en el **mismo formato de payload JSON** que el simulador.
      * Mantener el esquema de temas MQTT: `sensors/{type}/{sensorId}`.
  * **Documentación de Integración:**
      * Actualizar la sección **"Real Raspberry Pi Integration"** del `README.md` con pasos específicos de instalación de librerías Modbus, configuración de puertos serie y el comando de ejecución del nuevo script.

-----

## 2\. Estrategia de Incorporación de Nuevos Sensores (Escalabilidad) ➕

Actualmente, la adición de nuevos sensores es manual (registro en la API), pero el sistema de recolección de datos (el Pi) necesita saber qué y cómo leer. La escalabilidad depende de una estrategia clara.

### Análisis y Posibles Soluciones (Automatización)

| Opción de Estandarización | Descripción Breve | Implicaciones en la Estructura |
| :--- | :--- | :--- |
| **A. Configuración Local (Fija)** | La Raspberry Pi tiene un archivo de configuración (`sensors.json` o `.env`) estático que define los IDs, tipos, direcciones Modbus y el *topic* MQTT a usar. | **Fácil de implementar**. Se requiere re-despliegue (o reinicio) de la Pi para cada nuevo sensor. El *backend* no tiene control sobre la Pi. |
| **B. Configuración Centralizada (API-Driven)** | La Raspberry Pi consulta una API del *backend* al iniciar (o periódicamente) para obtener una lista de los sensores que debe leer (incluyendo direcciones Modbus) y los *topics* MQTT. | **Mejor escalabilidad y control**. Requiere un nuevo *endpoint* en la **`backend/api/config`** y lógica de configuración en el cliente Pi. El `SensorModel` puede necesitar campos extra (`modbusAddress`). |
| **C. Autodescubrimiento (IoT Estándar)** | La Pi escanea automáticamente un rango de direcciones Modbus, identifica qué dispositivos responden, y luego "registra" los nuevos sensores en el *backend* a través de un *endpoint* API o un *topic* MQTT específico (`register/new-sensor`). | **La más compleja, pero ideal para producción**. Requiere protocolos de autodescubrimiento y una API/lógica en el *backend* para manejar el registro de un sensor completamente nuevo. |

**Recomendación:** Implementar la **Opción C** para una mejor gestión centralizada del sistema.

-----

## 3\. Manejo de Múltiples Dispositivos Raspberry Pi 🌳

La arquitectura actual simula un solo Pi. Para un entorno real, es probable que se utilicen **múltiples Raspberry Pis**, cada una sirviendo como *gateway* para un grupo de sensores en una ubicación específica (o un solo Modbus *Bus*).

### Análisis del Flujo de Adición (Multi-Pi)

  * **Identificación Única:** Cada Pi debe tener un identificador único. Esto podría ser un **`PI_GATEWAY_ID`** en su archivo `.env` o un ID de hardware.
  * **Estructura del Topic MQTT:** Si un sensor (`temp-sensor-01`) está en dos ubicaciones diferentes (dos Pis), el *topic* actual puede colisionar.
      * **Solución Propuesta para el Topic:** Incluir el ID de la Pi en el tema MQTT:
        ```
        {PI_GATEWAY_ID}/sensors/{type}/{sensorId}
        Ejemplo: gate01/sensors/temperature/temp-sensor-01
        ```
  * **Actualización del Backend:** El servicio **`mqttService.ts`** debe ser capaz de parsear este nuevo formato de *topic* y, potencialmente, actualizar la ubicación del sensor o referenciar el *gateway* que envió el dato.

### Tareas y Estructura

  * **Actualizar el Modelo de Sensor:** Considerar añadir un campo `gatewayId: string` al `Sensor Model` para enlazar el sensor a su Raspberry Pi.
  * **Actualizar Suscripción MQTT:** Cambiar la suscripción del *backend* de `sensors/#` a `+/sensors/#` (o el comodín apropiado para la nueva estructura).
  * **Creación de un Simulador Multi-Pi:** Modificar el `pi-simulator` para que pueda ejecutar múltiples instancias con diferentes `PI_GATEWAY_ID` (usando un bucle o múltiples servicios en `compose.yml`) para probar esta nueva estructura.
  * **Desarrollar Lógica de Gateway:** Implementar en el cliente Pi la lectura del `PI_GATEWAY_ID` y su uso en la publicación MQTT.